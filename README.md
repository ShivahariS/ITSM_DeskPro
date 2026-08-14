# ITSMDeskPro — Microservices Edition

This is the original monolithic Spring Boot + Vite/React ITSM app, split into 5 backend
microservices + an API gateway, sitting in front of the unchanged React frontend.

**No message broker required.** Every service-to-service call is a plain synchronous REST
call over HTTP. The only infrastructure you need is MySQL.

## Services

| Service | Port | Owns | DB schema |
|---|---|---|---|
| identity-service | 8081 | Users, Auth (JWT issuance), Audit log | itsm_identity |
| incident-problem-service | 8082 | Incidents, Notes, Satisfaction, Problems, Known Errors | itsm_incident |
| change-management-service | 8083 | Change Requests, CAB Reviews, Implementations | itsm_change |
| asset-catalog-service | 8084 | Assets, Licenses, CMDB, Service Catalog, Service Requests | itsm_asset |
| notification-reporting-service | 8085 | Notifications, Cross-domain Reports/Analytics | itsm_notification |
| api-gateway | 8080 | Routes `/api/v1/**` to the right service above | — |

The frontend (unchanged, still on :5173) talks only to the gateway.

## What actually changed vs. the monolith

The monolith had **no JPA relations at all** — every cross-entity reference was already a
plain `Long` ID column, which is what made this split mechanical rather than a rewrite.
Three categories of in-process coupling had to be replaced with REST calls between services:

### 1. Notifications & audit logging → synchronous REST
Incident/Problem/Change/Asset-Catalog services used to call `NotificationService` and
`AuditService` directly (same JVM, same DB). They now POST to internal-only endpoints instead:

- `NotificationServiceClient.createNotification(...)` → `POST /api/internal/notifications`
  on notification-reporting-service, which still owns the `Notification` table and the exact
  same `createNotification(userID, message, category)` logic.
- `AuditServiceClient.log(...)` → `POST /api/internal/audit-logs` on identity-service, which
  still owns the `AuditLog` table.

These client classes keep the **same method signatures** as the old service interfaces, so the
calling code in each `*ServiceImpl` barely changed — it's a drop-in swap of dependency, not a
rewrite of business logic. Failures are logged and swallowed (best-effort) rather than blocking
the primary operation — e.g. if notification-reporting-service is briefly down, an incident can
still be created; it just won't get its "logged" notification.

### 2. "Who has role X" lookups → REST call to identity-service
`IncidentServiceImpl`, `ChangeManagementServiceImpl`, and `ServiceCatalogServiceImpl` used to
query `UserRepository.findByRole(...)` directly. Since only identity-service owns the `User`
table now, these became a REST call to `GET /api/internal/users/by-role/{role}` (and
`/by-team/{teamId}`) via a small `UserDirectoryClient` in each service.

All of these internal endpoints (`/api/internal/**`) are guarded by an `InternalApiKeyFilter` +
a shared `X-Internal-Api-Key` header — never exposed to the frontend, never checked against
end-user JWTs. In a real deployment you'd likely back this with network isolation / mTLS
instead of a static key.

### 3. Reporting/analytics → synchronous push to a read-model
The monolith's `ReportServiceImpl` read `IncidentRepository`, `IncidentNoteRepository`,
`SoftwareLicenseRepository`, `ChangeImplementationRepository`, and `ProblemRecordRepository`
**directly** to compute SLA/MTTR/FCR/change-success/license-compliance metrics. That's no longer
possible across separate databases, so:

- incident-problem-service, change-management-service, and asset-catalog-service call
  `ReportEventClient` right after saving a relevant record, which POSTs a denormalized snapshot
  to `POST /api/internal/report-events/{incident-changed|problem-changed|change-implementation|license-changed}`
  on notification-reporting-service.
- notification-reporting-service saves these into local **read-model replica tables**
  (`IncidentReportView`, `ProblemReportView`, `ChangeImplReportView`, `LicenseReportView`).
- `ReportServiceImpl` queries those replicas. The actual math (SLA %, MTTR, FCR %, change
  success %, problem recurrence %) is unchanged from the original.

Because this is now a direct synchronous call rather than a queued event, the replica is
updated in the same request as the source record — no lag, at the cost of the source service's
request taking slightly longer (and, being best-effort/swallowed on failure, an unreachable
notification-reporting-service means a report might miss that one update rather than blocking
the source operation).

### 4. Auth/JWT
Only identity-service issues tokens now. It embeds `userID` and `roles` as JWT claims. The other
4 services carry a **stateless, DB-free** JWT filter that just verifies the signature/expiry and
reads `userID`/`roles` out of the claims — no callback to identity-service per request, no shared
`UserDetailsService`. Controllers that used to take `@AuthenticationPrincipal User user` now take
`@AuthenticationPrincipal Long userID`, since these services no longer have a `User` entity.

## Running it

### With Docker
```bash
docker compose up --build
```
Starts MySQL (5 schemas auto-created), all 5 backend services, the gateway, and the frontend
dev server on :5173. Swagger UI for each service is at `http://localhost:<port>/swagger-ui.html`.

### Without Docker
Prerequisites: Java 17, Maven, Node.js, and a local MySQL on `:3306` (root/root). **That's it —
no RabbitMQ, no other broker.**

Start identity-service first (it's the only token issuer, and the others call it for user
lookups and audit logging):
```bash
cd identity-service && mvn spring-boot:run       # :8081
```
Then the rest, in any order:
```bash
cd incident-problem-service && mvn spring-boot:run   # :8082
cd change-management-service && mvn spring-boot:run  # :8083
cd asset-catalog-service && mvn spring-boot:run       # :8084
cd notification-reporting-service && mvn spring-boot:run  # :8085
```
Then the gateway:
```bash
cd api-gateway && mvn spring-boot:run   # :8080
```
Finally the frontend:
```bash
cd frontend && npm install && npm run dev
```
Open http://localhost:5173.

Each service auto-creates its own MySQL schema on first startup (`createDatabaseIfNotExist=true`)
— you just need MySQL itself running, not the schemas pre-created.

If your MySQL isn't on localhost, override with env vars, e.g.:
```bash
DB_HOST=my-db-host mvn spring-boot:run
```

## Known simplifications / things to harden before production

- The internal API key is a static shared secret in plaintext env vars — fine for a local
  demo, not for production (use mTLS/service mesh or a secrets manager instead).
- Internal REST calls are best-effort: a failed call is logged and swallowed rather than
  retried, so a transient outage of one service can cause a silently-missed notification or
  report update. Fine for a demo; production would want retries/circuit breakers (e.g.
  Resilience4j) or a proper outbox pattern.
- No distributed tracing (e.g. Sleuth/Zipkin/OpenTelemetry) wired up yet, which you'll want
  once you're debugging a request that crosses 3+ services.
- `ddl-auto: update` is kept per-service for parity with the original monolith's dev setup;
  swap for Flyway/Liquibase migrations before this goes anywhere near production.
- Synchronous REST between services means an outage of notification-reporting-service or
  identity-service adds latency (timeout) to calls from other services, not just a queued
  retry — this is the classic sync-vs-async tradeoff, and it went the "sync" way here to avoid
  the RabbitMQ dependency.
