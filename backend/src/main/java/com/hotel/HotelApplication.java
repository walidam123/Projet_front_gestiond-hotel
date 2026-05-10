package com.hotel;

import com.hotel.entity.User;
import com.hotel.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class HotelApplication {

    public static void main(String[] args) {
        SpringApplication.run(HotelApplication.class, args);
    }

    @Bean
    CommandLineRunner initUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setName("Administrator");
                admin.setEmail("admin@hotel.com");
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("Admin123"));
                admin.setRole("ROLE_ADMIN");
                admin.setActive(true);
                userRepository.save(admin);
            }
            if (userRepository.findByUsername("sara").isEmpty()) {
                User sara = new User();
                sara.setName("Sara Reception");
                sara.setEmail("sara@hotel.com");
                sara.setUsername("sara");
                sara.setPassword(passwordEncoder.encode("Reception1"));
                sara.setRole("ROLE_RECEPTIONNISTE");
                sara.setActive(true);
                userRepository.save(sara);
            }
        };
    }
}
