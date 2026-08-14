package com.itsm.identity.config;

import com.itsm.identity.entity.User;
import com.itsm.identity.enums.Role;
import com.itsm.identity.enums.UserStatus;
import com.itsm.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the 7 core users for ITSMDeskPro on startup.
 *
 * <p>Moved out of the old monolith's DataSeeder - this service now owns the User table.
 * asset-catalog-service's own seeder depends on these users already existing (it looks them
 * up by role over REST), so this service must finish starting - and seeding - before
 * asset-catalog-service's seeder runs.</p>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private static final Long TEAM_SERVICE_DESK = 1L; // Service Desk (L1)
    private static final Long TEAM_INFRA        = 2L; // Infrastructure & Systems (L2)
    private static final Long TEAM_SOFTWARE     = 3L; // Software & Core Platform Engineering (L3)
    private static final Long TEAM_CAB          = 4L; // Change Advisory Board (CAB)
    private static final Long TEAM_ASSET        = 5L; // IT Asset Management

    private static final String LOC_HQ     = "Headquarters - Building A";
    private static final String LOC_REMOTE = "Remote / Work From Home";
    private static final String LOC_WEST   = "Regional Office - West";

    private static final String DEFAULT_PASSWORD = "Password@123";

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("=== identity-service: users already present, skipping seed ===");
            return;
        }

        save(user("Administrator", "admin@itsmdeskpro.com",        "+91 2143658709", Role.ADMIN,          null,              LOC_HQ));
        save(user("End User",      "enduser@itsmdeskpro.com",       "+91 9078563412", Role.END_USER,       null,              LOC_REMOTE));
        save(user("L1 Support",    "l1.support@itsmdeskpro.com",    "+91 1324354657", Role.L1_SUPPORT,     TEAM_SERVICE_DESK, LOC_HQ));
        save(user("L2 Support",    "l2.support@itsmdeskpro.com",    "+91 2435465768", Role.L2_SUPPORT,     TEAM_INFRA,        LOC_HQ));
        save(user("L3 Support",    "l3.support@itsmdeskpro.com",    "+91 1425364758", Role.L3_SUPPORT,     TEAM_SOFTWARE,     LOC_WEST));
        save(user("Change Manager","change.manager@itsmdeskpro.com","+91 7968574635", Role.CHANGE_MANAGER, TEAM_CAB,          LOC_HQ));
        save(user("Asset Manager", "asset.manager@itsmdeskpro.com", "+91 4657687930", Role.ASSET_MANAGER,  TEAM_ASSET,        LOC_HQ));

        log.info("=====================================================");
        log.info("  identity-service seed complete. Default password: {}", DEFAULT_PASSWORD);
        log.info("  admin@itsmdeskpro.com / l1.support@itsmdeskpro.com / ...");
        log.info("  Swagger UI: http://localhost:8081/swagger-ui.html");
        log.info("=====================================================");
    }

    private User user(String name, String email, String phone, Role role, Long teamID, String locationID) {
        return User.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .role(role)
                .teamID(teamID)
                .locationID(locationID)
                .status(UserStatus.ACTIVE)
                .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                .build();
    }

    private User save(User u) {
        return userRepository.save(u);
    }
}
