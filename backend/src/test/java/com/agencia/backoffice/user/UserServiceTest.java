package com.agencia.backoffice.user;

import com.agencia.backoffice.common.error.ApiException;
import com.agencia.backoffice.common.error.FlowCode;
import com.agencia.backoffice.common.web.PageResponse;
import com.agencia.backoffice.user.dto.CreateUserRequest;
import com.agencia.backoffice.user.dto.UpdateUserRequest;
import com.agencia.backoffice.user.dto.UserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserServiceTest {

    private UserRepository userRepository;
    private RoleRepository roleRepository;
    private PasswordEncoder passwordEncoder;
    private UserService userService;
    private Role adminRole;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        roleRepository = mock(RoleRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        userService = new UserService(userRepository, roleRepository, passwordEncoder);

        adminRole = mock(Role.class);
        when(adminRole.getName()).thenReturn("ADMIN");
    }

    @Test
    void findAllNormalizesSearchAndMapsPage() {
        User user = userWithRole("ana@test.com", "Ana", "López", adminRole);
        Pageable pageable = PageRequest.of(0, 20);
        when(userRepository.search("ana", pageable))
                .thenReturn(new PageImpl<>(List.of(user), pageable, 1));

        PageResponse<UserResponse> response = userService.findAll("  ana  ", pageable);

        assertEquals(1, response.content().size());
        assertEquals(1, response.totalElements());
        assertEquals("ana@test.com", response.content().getFirst().email());
        assertEquals(List.of("ADMIN"), response.content().getFirst().roles());
    }

    @Test
    void createRejectsDuplicateEmail() {
        when(userRepository.existsByEmail("ana@test.com")).thenReturn(true);

        ApiException ex = assertThrows(ApiException.class, () -> userService.create(
                new CreateUserRequest("ANA@test.com ", "secret123", "Ana", "López", List.of("ADMIN"))));

        assertEquals(FlowCode.CONFLICT, ex.flowCode());
        verify(userRepository, never()).saveAndFlush(any());
    }

    @Test
    void createRejectsUnknownRole() {
        when(userRepository.existsByEmail("ana@test.com")).thenReturn(false);
        when(roleRepository.findByName("GHOST")).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> userService.create(
                new CreateUserRequest("ana@test.com", "secret123", "Ana", "López", List.of("GHOST"))));

        assertEquals(FlowCode.VALIDATION_ERROR, ex.flowCode());
        assertEquals("roles", ex.details().getFirst().field());
        verify(userRepository, never()).saveAndFlush(any());
    }

    @Test
    void createEncodesPasswordAndAssignsRoles() {
        when(userRepository.existsByEmail("ana@test.com")).thenReturn(false);
        when(roleRepository.findByName("ADMIN")).thenReturn(Optional.of(adminRole));
        when(passwordEncoder.encode("secret123")).thenReturn("encoded-hash");
        when(userRepository.saveAndFlush(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userService.create(
                new CreateUserRequest(" ANA@test.com ", "secret123", " Ana ", "  ", List.of(" admin ")));

        assertEquals("ana@test.com", response.email());
        assertEquals("Ana", response.firstName());
        assertEquals(List.of("ADMIN"), response.roles());
        verify(passwordEncoder).encode("secret123");
        verify(userRepository).saveAndFlush(any(User.class));
    }

    @Test
    void updateRejectsMissingUser() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> userService.update(id,
                new UpdateUserRequest("ana@test.com", "Ana", "López", List.of("ADMIN"))));

        assertEquals(FlowCode.NOT_FOUND, ex.flowCode());
    }

    @Test
    void updateRejectsEmailUsedByAnotherUser() {
        UUID id = UUID.randomUUID();
        User user = userWithRole("ana@test.com", "Ana", "López", adminRole);
        when(userRepository.findById(id)).thenReturn(Optional.of(user));
        when(userRepository.existsByEmailAndIdNot("nueva@test.com", id)).thenReturn(true);

        ApiException ex = assertThrows(ApiException.class, () -> userService.update(id,
                new UpdateUserRequest("nueva@test.com", "Ana", "López", List.of("ADMIN"))));

        assertEquals(FlowCode.CONFLICT, ex.flowCode());
    }

    @Test
    void updateChangesProfileAndRoles() {
        UUID id = UUID.randomUUID();
        User user = userWithRole("ana@test.com", "Ana", "López", adminRole);
        when(userRepository.findById(id)).thenReturn(Optional.of(user));
        when(userRepository.existsByEmailAndIdNot("ana.nueva@test.com", id)).thenReturn(false);
        when(roleRepository.findByName("ADMIN")).thenReturn(Optional.of(adminRole));
        when(userRepository.saveAndFlush(user)).thenReturn(user);

        UserResponse response = userService.update(id,
                new UpdateUserRequest("ANA.NUEVA@test.com", "Ana María", "López", List.of("ADMIN")));

        assertEquals("ana.nueva@test.com", response.email());
        assertEquals("Ana María", response.firstName());
    }

    @Test
    void updateStatusTogglesEnabled() {
        UUID id = UUID.randomUUID();
        User user = userWithRole("ana@test.com", "Ana", "López", adminRole);
        when(userRepository.findById(id)).thenReturn(Optional.of(user));
        when(userRepository.saveAndFlush(user)).thenReturn(user);

        UserResponse response = userService.updateStatus(id, false);

        assertFalse(response.enabled());
        assertFalse(user.isEnabled());
        assertTrue(userService.updateStatus(id, true).enabled());
    }

    private static User userWithRole(String email, String firstName, String lastName, Role role) {
        User user = User.create(email, "hash", firstName, lastName);
        user.addRole(role);
        return user;
    }
}
