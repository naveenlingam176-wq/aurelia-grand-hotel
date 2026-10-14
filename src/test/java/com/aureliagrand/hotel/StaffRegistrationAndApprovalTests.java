package com.aureliagrand.hotel;

import com.aureliagrand.hotel.dto.GuestRegisterRequest;
import com.aureliagrand.hotel.dto.LoginRequest;
import com.aureliagrand.hotel.dto.LoginResponse;
import com.aureliagrand.hotel.dto.RegisterRequest;
import com.aureliagrand.hotel.dto.StaffRegisterRequest;
import com.aureliagrand.hotel.dto.UserDto;
import com.aureliagrand.hotel.entity.AccountStatus;
import com.aureliagrand.hotel.entity.Role;
import com.aureliagrand.hotel.exception.AccountPendingException;
import com.aureliagrand.hotel.exception.AccountRejectedException;
import com.aureliagrand.hotel.exception.BadRequestException;
import com.aureliagrand.hotel.exception.ConflictException;
import com.aureliagrand.hotel.service.AuthService;
import com.aureliagrand.hotel.service.StaffApprovalService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class StaffRegistrationAndApprovalTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthService authService;

    @Autowired
    private StaffApprovalService staffApprovalService;

    @Test
    void testExistingAdminCanLoginAndAccessDashboard() throws Exception {
        LoginRequest loginReq = new LoginRequest("admin@aureliagrand.com", "AdminPassword123!");
        LoginResponse response = authService.login(loginReq);

        assertNotNull(response);
        assertEquals("ADMIN", response.getRole());
        assertNotNull(response.getToken());

        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + response.getToken()))
                .andExpect(status().isOk());
    }

    @Test
    void testGuestRegistrationAndImmediateLogin() throws Exception {
        String email = "guest." + System.currentTimeMillis() + "@test.com";
        GuestRegisterRequest regReq = new GuestRegisterRequest(
                "Countess Genevieve", email, "+91 9988776655", "SecretGuest123!", "SecretGuest123!"
        );

        UserDto created = authService.registerGuest(regReq);
        assertNotNull(created);
        assertEquals("GUEST", created.getRole());
        assertEquals("APPROVED", created.getStatus());
        assertTrue(created.getActive());

        // Login as new guest
        LoginRequest loginReq = new LoginRequest(email, "SecretGuest123!");
        LoginResponse loginResp = authService.login(loginReq);
        assertNotNull(loginResp);
        assertEquals("GUEST", loginResp.getRole());
        assertNotNull(loginResp.getToken());
    }

    @Test
    void testDuplicateEmailRegistrationIsRejected() {
        String email = "dup." + System.currentTimeMillis() + "@test.com";
        GuestRegisterRequest reg1 = new GuestRegisterRequest(
                "User One", email, "+91 9988776655", "Secret123!", "Secret123!"
        );
        authService.registerGuest(reg1);

        GuestRegisterRequest reg2 = new GuestRegisterRequest(
                "User Two", email, "+91 9988776655", "Secret123!", "Secret123!"
        );
        assertThrows(ConflictException.class, () -> authService.registerGuest(reg2));
    }

    @Test
    void testStaffRegistrationWorkflowAndPendingBlock() throws Exception {
        String staffEmail = "applicant." + System.currentTimeMillis() + "@aureliagrand.com";
        StaffRegisterRequest staffReq = new StaffRegisterRequest(
                "Marco Bellini", staffEmail, "+91 98765 43219", "Concierge", "StaffKey123!", "StaffKey123!"
        );

        UserDto applicant = authService.registerStaff(staffReq);
        assertNotNull(applicant);
        assertEquals("STAFF", applicant.getRole());
        assertEquals("PENDING", applicant.getStatus());
        assertFalse(applicant.getActive());

        // Pending staff cannot log in
        LoginRequest pendingLogin = new LoginRequest(staffEmail, "StaffKey123!");
        assertThrows(AccountPendingException.class, () -> authService.login(pendingLogin));

        // MockMvc check for HTTP 403 Forbidden with pending message
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pendingLogin)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Your staff account application is currently PENDING administrative approval. Please await executive review."));

        // Admin logs in and approves staff
        LoginResponse adminLogin = authService.login(new LoginRequest("admin@aureliagrand.com", "AdminPassword123!"));

        mockMvc.perform(put("/api/admin/staff-applications/" + applicant.getId() + "/approve")
                        .header("Authorization", "Bearer " + adminLogin.getToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.active").value(true));

        // Approved staff can now log in
        LoginResponse approvedLogin = authService.login(pendingLogin);
        assertNotNull(approvedLogin);
        assertEquals("STAFF", approvedLogin.getRole());
        assertEquals("APPROVED", approvedLogin.getStatus());
        assertNotNull(approvedLogin.getToken());
    }

    @Test
    void testStaffRejectionWorkflow() throws Exception {
        String staffEmail = "reject." + System.currentTimeMillis() + "@aureliagrand.com";
        StaffRegisterRequest staffReq = new StaffRegisterRequest(
                "Test Reject", staffEmail, "+91 98765 11111", "Events", "StaffKey123!", "StaffKey123!"
        );

        UserDto applicant = authService.registerStaff(staffReq);
        assertEquals("PENDING", applicant.getStatus());

        // Admin logs in and rejects staff
        LoginResponse adminLogin = authService.login(new LoginRequest("admin@aureliagrand.com", "AdminPassword123!"));

        mockMvc.perform(put("/api/admin/staff-applications/" + applicant.getId() + "/reject")
                        .header("Authorization", "Bearer " + adminLogin.getToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.active").value(false));

        // Rejected staff cannot log in
        LoginRequest rejectedLogin = new LoginRequest(staffEmail, "StaffKey123!");
        assertThrows(AccountRejectedException.class, () -> authService.login(rejectedLogin));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rejectedLogin)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Your staff account application has been REJECTED. Access is not permitted."));
    }

    @Test
    void testAuthorizationRoleSeparation() throws Exception {
        // Guest credentials
        LoginResponse guestLogin = authService.login(new LoginRequest("user@aureliagrand.com", "UserPassword123!"));
        // Staff credentials
        LoginResponse staffLogin = authService.login(new LoginRequest("staff@aureliagrand.com", "StaffPassword123!"));

        // Guest cannot access Staff/Admin search
        mockMvc.perform(get("/api/search")
                        .header("Authorization", "Bearer " + guestLogin.getToken()))
                .andExpect(status().isForbidden());

        // Guest cannot access Admin users
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + guestLogin.getToken()))
                .andExpect(status().isForbidden());

        // Guest cannot access Admin staff approvals
        mockMvc.perform(get("/api/admin/staff-applications")
                        .header("Authorization", "Bearer " + guestLogin.getToken()))
                .andExpect(status().isForbidden());

        // Staff can access operational search
        mockMvc.perform(get("/api/search")
                        .header("Authorization", "Bearer " + staffLogin.getToken()))
                .andExpect(status().isOk());

        // Staff CANNOT access Admin users
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + staffLogin.getToken()))
                .andExpect(status().isForbidden());

        // Staff CANNOT access Admin staff approvals
        mockMvc.perform(get("/api/admin/staff-applications")
                        .header("Authorization", "Bearer " + staffLogin.getToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    void testPublicUserCannotRegisterAsAdmin() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Malicious Actor");
        req.setEmail("hacker." + System.currentTimeMillis() + "@test.com");
        req.setPassword("Password123!");
        req.setRole(Role.ADMIN);

        assertThrows(BadRequestException.class, () -> authService.register(req));
    }

    @Test
    void testNonAdminCannotApproveOrRejectStaff() throws Exception {
        LoginResponse guestLogin = authService.login(new LoginRequest("user@aureliagrand.com", "UserPassword123!"));
        LoginResponse staffLogin = authService.login(new LoginRequest("staff@aureliagrand.com", "StaffPassword123!"));

        mockMvc.perform(put("/api/admin/staff-applications/1/approve")
                        .header("Authorization", "Bearer " + guestLogin.getToken()))
                .andExpect(status().isForbidden());

        mockMvc.perform(put("/api/admin/staff-applications/1/reject")
                        .header("Authorization", "Bearer " + guestLogin.getToken()))
                .andExpect(status().isForbidden());

        mockMvc.perform(put("/api/admin/staff-applications/1/approve")
                        .header("Authorization", "Bearer " + staffLogin.getToken()))
                .andExpect(status().isForbidden());

        mockMvc.perform(put("/api/admin/staff-applications/1/reject")
                        .header("Authorization", "Bearer " + staffLogin.getToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    void testCannotReviewAlreadyReviewedStaff() throws Exception {
        String staffEmail = "reviewed." + System.currentTimeMillis() + "@aureliagrand.com";
        StaffRegisterRequest staffReq = new StaffRegisterRequest(
                "Reviewed Staff", staffEmail, "+91 98765 00000", "Maintenance", "StaffKey123!", "StaffKey123!"
        );
        UserDto applicant = authService.registerStaff(staffReq);

        LoginResponse adminLogin = authService.login(new LoginRequest("admin@aureliagrand.com", "AdminPassword123!"));

        // First approval succeeds
        mockMvc.perform(put("/api/admin/staff-applications/" + applicant.getId() + "/approve")
                        .header("Authorization", "Bearer " + adminLogin.getToken()))
                .andExpect(status().isOk());

        // Second approval attempt returns 400 Bad Request
        mockMvc.perform(put("/api/admin/staff-applications/" + applicant.getId() + "/approve")
                        .header("Authorization", "Bearer " + adminLogin.getToken()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Only pending staff accounts can be reviewed. Current status is APPROVED"));
    }
}
