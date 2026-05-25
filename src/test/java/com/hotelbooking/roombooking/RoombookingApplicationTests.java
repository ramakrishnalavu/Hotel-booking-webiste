package com.hotelbooking.roombooking;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.hotelbooking.roombooking.repository.UserRepository;

@SpringBootTest
class RoombookingApplicationTests {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Test
	void contextLoads() {
		String encoded = passwordEncoder.encode("password");
		System.out.println("====== FRESH BCRYPT HASH FOR 'password' ======");
		System.out.println(encoded);
		System.out.println("===============================================");
		
		boolean matchesFresh = passwordEncoder.matches("password", encoded);
		System.out.println("Matches fresh: " + matchesFresh);
	}

}
