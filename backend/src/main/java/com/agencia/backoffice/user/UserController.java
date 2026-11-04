package com.agencia.backoffice.user;

import com.agencia.backoffice.auth.UserPrincipal;
import com.agencia.backoffice.common.error.ApiException;
import com.agencia.backoffice.common.error.FlowCode;
import com.agencia.backoffice.common.web.PageResponse;
import com.agencia.backoffice.user.dto.CreateUserRequest;
import com.agencia.backoffice.user.dto.UpdateUserRequest;
import com.agencia.backoffice.user.dto.UpdateUserStatusRequest;
import com.agencia.backoffice.user.dto.UserResponse;
import com.agencia.backoffice.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Usuarios", description = "Gestión de usuarios. Requiere rol ADMIN.")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class UserController {

    private static final Set<String> ALLOWED_SORTS = Set.of("createdAt", "email", "firstName", "lastName");

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Listar usuarios",
            description = "Listado paginado. `search` filtra por email, nombre o apellido.")
    public PageResponse<UserResponse> findAll(
            @Parameter(description = "Texto a buscar en email, nombre o apellido")
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        validateSort(pageable.getSort());
        return userService.findAll(search, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por id")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario encontrado"),
            @ApiResponse(responseCode = "404", description = "Usuario inexistente (RES-001)")
    })
    public UserResponse findById(@PathVariable UUID id) {
        return userService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear usuario",
            description = "Crea un usuario con contraseña y roles existentes (ADMIN, USER).")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Usuario creado"),
            @ApiResponse(responseCode = "400", description = "Datos o roles inválidos (VAL-001)"),
            @ApiResponse(responseCode = "409", description = "Email ya registrado (RES-002)")
    })
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return userService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar usuario",
            description = "Actualiza email, nombre, apellido y roles. No cambia la contraseña.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario actualizado"),
            @ApiResponse(responseCode = "400", description = "Datos o roles inválidos (VAL-001)"),
            @ApiResponse(responseCode = "404", description = "Usuario inexistente (RES-001)"),
            @ApiResponse(responseCode = "409", description = "Email ya registrado (RES-002)")
    })
    public UserResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateUserRequest request) {
        return userService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Activar o desactivar usuario",
            description = "Desactivar impide el login. Un administrador no puede desactivar su propia cuenta.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Estado actualizado"),
            @ApiResponse(responseCode = "400", description = "Autodesactivación rechazada (VAL-001)"),
            @ApiResponse(responseCode = "404", description = "Usuario inexistente (RES-001)")
    })
    public UserResponse updateStatus(@PathVariable UUID id,
                                     @Valid @RequestBody UpdateUserStatusRequest request,
                                     Authentication authentication) {
        if (!request.enabled() && isCurrentUser(authentication, id)) {
            throw new ApiException(FlowCode.VALIDATION_ERROR,
                    "No puedes desactivar tu propia cuenta.");
        }
        return userService.updateStatus(id, request.enabled());
    }

    private static void validateSort(Sort sort) {
        boolean unsupported = sort.stream().anyMatch(order -> !ALLOWED_SORTS.contains(order.getProperty()));
        if (unsupported) {
            throw new ApiException(FlowCode.INVALID_REQUEST, "El criterio de ordenamiento no es válido.");
        }
    }

    private static boolean isCurrentUser(Authentication authentication, UUID id) {
        return authentication != null
                && authentication.getPrincipal() instanceof UserPrincipal currentUser
                && currentUser.id().equals(id);
    }
}
