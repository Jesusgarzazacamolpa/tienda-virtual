package com.agencia.backoffice.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, UUID id);

    @Query("""
            select u from User u
            where lower(u.email) like lower(concat('%', coalesce(:search, ''), '%'))
               or lower(u.firstName) like lower(concat('%', coalesce(:search, ''), '%'))
               or lower(u.lastName) like lower(concat('%', coalesce(:search, ''), '%'))
            """)
    Page<User> search(@Param("search") String search, Pageable pageable);
}
