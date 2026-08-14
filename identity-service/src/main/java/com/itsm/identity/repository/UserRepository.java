package com.itsm.identity.repository;

import com.itsm.identity.entity.User;
import com.itsm.identity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByTeamID(Long teamID);
}
