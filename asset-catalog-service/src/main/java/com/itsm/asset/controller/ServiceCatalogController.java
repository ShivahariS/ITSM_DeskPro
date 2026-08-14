/*package com.itsm.asset.controller;

import com.itsm.asset.dto.request.CatalogItemRequest;
import com.itsm.asset.dto.request.ServiceRequestRequest;
import com.itsm.asset.entity.ServiceCatalogItem;
import com.itsm.asset.entity.ServiceRequest;
import com.itsm.asset.enums.ServiceRequestStatus;
import com.itsm.asset.service.ServiceCatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Service Catalog & Requests", description = "Browse catalog and manage service requests")
public class ServiceCatalogController {

    private final ServiceCatalogService service;

    @GetMapping("/catalog")
    @Operation(summary = "Browse active service catalog")
    public ResponseEntity<List<ServiceCatalogItem>> getCatalog() {
        return ResponseEntity.ok(service.getActiveCatalog());
    }

    @GetMapping("/catalog/{id}")
    @Operation(summary = "Get catalog item by ID")
    public ResponseEntity<ServiceCatalogItem> getCatalogItem(@PathVariable Long id) {
        return ResponseEntity.ok(service.getCatalogItemById(id));
    }

    @PostMapping("/catalog")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create catalog item [ADMIN]")
    public ResponseEntity<ServiceCatalogItem> createCatalogItem(@Valid @RequestBody CatalogItemRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createCatalogItem(req));
    }

    @PutMapping("/catalog/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update catalog item [ADMIN]")
    public ResponseEntity<ServiceCatalogItem> updateCatalogItem(@PathVariable Long id,
                                                                 @Valid @RequestBody CatalogItemRequest req) {
        return ResponseEntity.ok(service.updateCatalogItem(id, req));
    }

    @DeleteMapping("/catalog/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate catalog item [ADMIN]")
    public ResponseEntity<Void> deactivateCatalogItem(@PathVariable Long id) {
        service.deactivateCatalogItem(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/requests")
    @PreAuthorize("hasAnyRole('END_USER','ADMIN')")
    @Operation(summary = "Submit service request")
    public ResponseEntity<ServiceRequest> submitRequest(@Valid @RequestBody ServiceRequestRequest req,
                                                        @AuthenticationPrincipal Long userID) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.submitRequest(req, userID));
    }

    @GetMapping("/requests")
    @PreAuthorize("hasAnyRole('L1_SUPPORT','L2_SUPPORT','L3_SUPPORT','ADMIN')")
    @Operation(summary = "Get all service requests [Support/Admin]")
    public ResponseEntity<List<ServiceRequest>> getAllRequests() {
        return ResponseEntity.ok(service.getAllRequests());
    }

    @GetMapping("/requests/my")
    @Operation(summary = "Get my service requests")
    public ResponseEntity<List<ServiceRequest>> getMyRequests(@AuthenticationPrincipal Long userID) {
        return ResponseEntity.ok(service.getMyRequests(userID));
    }

    @GetMapping("/requests/{id}")
    @Operation(summary = "Get service request by ID")
    public ResponseEntity<ServiceRequest> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getRequestById(id));
    }

    @PatchMapping("/requests/{id}/status")
    @PreAuthorize("hasAnyRole('L1_SUPPORT','L2_SUPPORT','L3_SUPPORT','ADMIN')")
    @Operation(summary = "Update request status [Support/Admin]")
    public ResponseEntity<ServiceRequest> updateStatus(@PathVariable Long id,
                                                       @RequestParam ServiceRequestStatus status,
                                                       @RequestParam(required = false) Long assignedToID) {
        return ResponseEntity.ok(service.updateRequestStatus(id, status, assignedToID));
    }
}
*/

package com.itsm.asset.controller;

import com.itsm.asset.dto.request.CatalogItemRequest;
import com.itsm.asset.dto.request.ServiceRequestRequest;
import com.itsm.asset.entity.ServiceCatalogItem;
import com.itsm.asset.entity.ServiceRequest;
import com.itsm.asset.enums.ServiceRequestStatus;
import com.itsm.asset.service.ServiceCatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Service Catalog & Requests", description = "Browse catalog and manage service requests")
public class ServiceCatalogController {

    private final ServiceCatalogService service;

    @GetMapping("/catalog")
    @Operation(summary = "Browse active service catalog")
    public ResponseEntity<List<ServiceCatalogItem>> getCatalog() {
        return ResponseEntity.ok(service.getActiveCatalog());
    }

    @GetMapping("/catalog/{id}")
    @Operation(summary = "Get catalog item by ID")
    public ResponseEntity<ServiceCatalogItem> getCatalogItem(@PathVariable Long id) {
        return ResponseEntity.ok(service.getCatalogItemById(id));
    }

    @PostMapping("/catalog")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create catalog item [ADMIN]")
    public ResponseEntity<ServiceCatalogItem> createCatalogItem(@Valid @RequestBody CatalogItemRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createCatalogItem(req));
    }

    @PutMapping("/catalog/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update catalog item [ADMIN]")
    public ResponseEntity<ServiceCatalogItem> updateCatalogItem(@PathVariable Long id,
                                                                @Valid @RequestBody CatalogItemRequest req) {
        return ResponseEntity.ok(service.updateCatalogItem(id, req));
    }

    @DeleteMapping("/catalog/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate catalog item [ADMIN]")
    public ResponseEntity<Void> deactivateCatalogItem(@PathVariable Long id) {
        service.deactivateCatalogItem(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/requests")
    @PreAuthorize("hasAnyRole('END_USER','ADMIN')")
    @Operation(summary = "Submit service request")
    public ResponseEntity<ServiceRequest> submitRequest(@Valid @RequestBody ServiceRequestRequest req,
                                                        @AuthenticationPrincipal Long userID) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.submitRequest(req, userID));
    }

    @GetMapping("/requests")
    @PreAuthorize("hasAnyRole('L1_SUPPORT','L2_SUPPORT','L3_SUPPORT','ASSET_MANAGER','ADMIN')")
    @Operation(summary = "Get all service requests [Support/Asset/Admin]")
    public ResponseEntity<List<ServiceRequest>> getAllRequests() {
        return ResponseEntity.ok(service.getAllRequests());
    }

    @GetMapping("/requests/my")
    @Operation(summary = "Get my service requests")
    public ResponseEntity<List<ServiceRequest>> getMyRequests(@AuthenticationPrincipal Long userID) {
        return ResponseEntity.ok(service.getMyRequests(userID));
    }

    @GetMapping("/requests/{id}")
    @Operation(summary = "Get service request by ID")
    public ResponseEntity<ServiceRequest> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getRequestById(id));
    }

    @PatchMapping("/requests/{id}/status")
    @PreAuthorize("hasAnyRole('L1_SUPPORT','L2_SUPPORT','L3_SUPPORT','ASSET_MANAGER','ADMIN')")
    @Operation(summary = "Update request status [Support/Asset/Admin]")
    public ResponseEntity<ServiceRequest> updateStatus(@PathVariable Long id,
                                                       @RequestParam ServiceRequestStatus status,
                                                       @RequestParam(required = false) Long assignedToID,
                                                       @RequestParam(required = false) String remark) {
        return ResponseEntity.ok(service.updateRequestStatus(id, status, assignedToID, remark));
    }
}