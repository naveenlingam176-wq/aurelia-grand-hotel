package com.aureliagrand.hotel;

import com.aureliagrand.hotel.dto.LoginRequest;
import com.aureliagrand.hotel.dto.LoginResponse;
import com.aureliagrand.hotel.dto.RegisterRequest;
import com.aureliagrand.hotel.dto.UserDto;
import com.aureliagrand.hotel.entity.Role;
import com.aureliagrand.hotel.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AuthServiceTests {

    @Autowired
    private AuthService authService;

    @Test
    void testAdminLoginSuccess() {
        LoginRequest request = new LoginRequest("admin@aureliagrand.com", "AdminPassword123!");
        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertNotNull(response.getToken());
        assertEquals("ADMIN", response.getRole());
        assertEquals("admin@aureliagrand.com", response.getEmail());
    }

    @Test
    void testStaffLoginSuccess() {
        LoginRequest request = new LoginRequest("staff@aureliagrand.com", "StaffPassword123!");
        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("STAFF", response.getRole());
    }

    @Test
    void testGuestLoginSuccess() {
        LoginRequest request = new LoginRequest("user@aureliagrand.com", "UserPassword123!");
        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("GUEST", response.getRole());
    }

    @Test
    void testInvalidPasswordFails() {
        LoginRequest request = new LoginRequest("admin@aureliagrand.com", "WrongPassword!");
        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    @Test
    void testRegisterNewUser() {
        String testEmail = "testnewguest" + System.currentTimeMillis() + "@aureliagrand.com";
        RegisterRequest req = new RegisterRequest();
        req.setName("Countess Eleanor");
        req.setEmail(testEmail);
        req.setPassword("Eleanor1234!");
        req.setRole(Role.GUEST);

        UserDto created = authService.register(req);
        assertNotNull(created);
        assertEquals(testEmail, created.getEmail());
        assertEquals("GUEST", created.getRole());
    }
}
