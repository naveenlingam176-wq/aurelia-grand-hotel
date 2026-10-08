package com.aureliagrand.hotel;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testPublicEndpointsAreAccessible() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("healthy"));

        mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/party-halls"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/restaurants"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Test /api/auth/health alias
        mockMvc.perform(get("/api/auth/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("healthy"));
    }

    @Test
    void testOpenApiAndSwaggerEndpointsAreAccessible() throws Exception {
        // Test OpenAPI v3 JSON spec
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.openapi").isString())
                .andExpect(jsonPath("$.info.title").value("Aurelia Grand Luxury & Resorts API"))
                .andExpect(jsonPath("$.info.version").value("1.0.0"))
                .andExpect(jsonPath("$.components.securitySchemes.BearerAuth").exists())
                .andExpect(jsonPath("$.components.securitySchemes.BearerAuth.type").value("http"))
                .andExpect(jsonPath("$.components.securitySchemes.BearerAuth.scheme").value("bearer"));

        // Test Swagger UI HTML page
        mockMvc.perform(get("/swagger-ui/index.html"))
                .andExpect(status().isOk());
    }

    @Test
    void testLoginFlowAndProtectedEndpoint() throws Exception {
        // 1. Invalid login
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@aureliagrand.com\",\"password\":\"BadPassword\"}"))
                .andExpect(status().isUnauthorized());

        // 2. Successful login
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@aureliagrand.com\",\"password\":\"AdminPassword123!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        Map<?, ?> map = objectMapper.readValue(responseBody, Map.class);
        String token = (String) map.get("token");
        assertNotNull(token);

        // 3. Protected endpoint without token -> Forbidden/Unauthorized
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isForbidden());

        // 4. Protected endpoint with Bearer token -> Success
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.user.email").value("admin@aureliagrand.com"))
                .andExpect(jsonPath("$.user.role").value("ADMIN"));
    }
}
