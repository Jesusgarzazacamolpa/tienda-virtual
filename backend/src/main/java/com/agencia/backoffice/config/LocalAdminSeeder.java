package com.agencia.backoffice.config;

import com.agencia.backoffice.common.text.Emails;
import com.agencia.backoffice.user.Role;
import com.agencia.backoffice.user.RoleRepository;
import com.agencia.backoffice.user.User;
import com.agencia.backoffice.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("local")
public class LocalAdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(LocalAdminSeeder.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;

    public LocalAdminSeeder(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.local-admin.email:admin@backoffice.local}") String email,
            @Value("${app.local-admin.password:Admin123!}") String password) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        String normalizedEmail = Emails.normalize(email);
        if (userRepository.existsByEmail(normalizedEmail)) {
            return;
        }

        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new IllegalStateException(
                        "Falta el rol ADMIN; revisa las migraciones Flyway."));

        User admin = User.create(normalizedEmail, passwordEncoder.encode(password), "Local", "Admin");
        admin.addRole(adminRole);
        userRepository.save(admin);

        log.info("Usuario admin local creado: {}", normalizedEmail);
    }
}
