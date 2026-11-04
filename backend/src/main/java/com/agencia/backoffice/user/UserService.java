package com.agencia.backoffice.user;

import com.agencia.backoffice.common.error.ApiErrorResponse;
import com.agencia.backoffice.common.error.ApiException;
import com.agencia.backoffice.common.error.FlowCode;
import com.agencia.backoffice.common.text.Emails;
import com.agencia.backoffice.common.web.PageResponse;
import com.agencia.backoffice.user.dto.CreateUserRequest;
import com.agencia.backoffice.user.dto.UpdateUserRequest;
import com.agencia.backoffice.user.dto.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> findAll(String search, Pageable pageable) {
        String term = normalizeSearch(search);
        Page<User> page = userRepository.search(term, pageable);
        return PageResponse.from(page.map(UserResponse::from));
    }

    @Transactional(readOnly = true)
    public UserResponse findById(UUID id) {
        return UserResponse.from(getUser(id));
    }

    public UserResponse create(CreateUserRequest request) {
        String email = Emails.normalize(request.email());
        ensureEmailAvailable(email, null);

        User user = User.create(email, passwordEncoder.encode(request.password()),
                request.firstName().trim(), normalizeNullable(request.lastName()));
        user.replaceRoles(resolveRoles(request.roles()));
        return save(user);
    }

    public UserResponse update(UUID id, UpdateUserRequest request) {
        User user = getUser(id);
        String email = Emails.normalize(request.email());
        ensureEmailAvailable(email, id);

        user.updateProfile(email, request.firstName().trim(), normalizeNullable(request.lastName()));
        user.replaceRoles(resolveRoles(request.roles()));
        return save(user);
    }

    public UserResponse updateStatus(UUID id, boolean enabled) {
        User user = getUser(id);
        user.setEnabled(enabled);
        return save(user);
    }

    private UserResponse save(User user) {
        return UserResponse.from(userRepository.saveAndFlush(user));
    }

    private void ensureEmailAvailable(String email, UUID currentUserId) {
        boolean taken = currentUserId == null
                ? userRepository.existsByEmail(email)
                : userRepository.existsByEmailAndIdNot(email, currentUserId);
        if (taken) {
            throw new ApiException(FlowCode.CONFLICT, "Ya existe un usuario con ese email.");
        }
    }

    private User getUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException(FlowCode.NOT_FOUND, "El usuario solicitado no existe."));
    }

    private Set<Role> resolveRoles(List<String> roleNames) {
        Set<String> normalized = new LinkedHashSet<>();
        for (String roleName : roleNames) {
            normalized.add(roleName.trim().toUpperCase(Locale.ROOT));
        }

        List<ApiErrorResponse.FieldError> missing = new ArrayList<>();
        Set<Role> roles = new LinkedHashSet<>();
        for (String roleName : normalized) {
            roleRepository.findByName(roleName)
                    .ifPresentOrElse(roles::add,
                            () -> missing.add(new ApiErrorResponse.FieldError("roles",
                                    "El rol " + roleName + " no existe.")));
        }

        if (!missing.isEmpty()) {
            throw new ApiException(FlowCode.VALIDATION_ERROR,
                    "Uno o más roles no son válidos.", missing);
        }
        return roles;
    }

    private static String normalizeSearch(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        return search.trim();
    }

    private static String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
