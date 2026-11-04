package com.agencia.backoffice.user;

import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.List;

public final class RoleNames {

    private static final String PREFIX = "ROLE_";

    private RoleNames() {
    }

    public static List<String> fromRoles(Collection<Role> roles) {
        return roles.stream()
                .map(Role::getName)
                .sorted()
                .toList();
    }

    // Spring Security expone las autoridades con prefijo ROLE_; la API las devuelve sin él.
    public static List<String> fromAuthorities(Collection<? extends GrantedAuthority> authorities) {
        return authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .map(authority -> authority.startsWith(PREFIX) ? authority.substring(PREFIX.length()) : authority)
                .sorted()
                .toList();
    }
}
