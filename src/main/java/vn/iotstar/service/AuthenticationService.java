package vn.iotstar.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import vn.iotstar.dto.LoginRequest;
import vn.iotstar.dto.RegisterRequest;
import vn.iotstar.entity.User;
import vn.iotstar.repository.UserRepository;

@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthenticationService(UserRepository userRepository,
                                 PasswordEncoder passwordEncoder,
                                 AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    public User signup(RegisterRequest input) {
        String email = input.getEmail()
                .trim()
                .toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalStateException("Email already exists");
        }

        User user = new User();

        user.setFullName(
                input.getFullName().trim()
        );

        user.setEmail(email);

        if (input.getImages() == null
                || input.getImages().isBlank()) {

            user.setImages(
                    "/images/default-avatar.png"
            );
        } else {
            user.setImages(
                    input.getImages().trim()
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        input.getPassword()
                )
        );

        user.setRole("ROLE_USER");

        return userRepository.save(user);
    }

    public User authenticate(LoginRequest input) {
        String email = input.getEmail()
                .trim()
                .toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        input.getPassword()
                )
        );

        return userRepository.findByEmail(email)
                .orElseThrow(
                        () -> new IllegalStateException(
                                "User not found after authentication"
                        )
                );
    }
}