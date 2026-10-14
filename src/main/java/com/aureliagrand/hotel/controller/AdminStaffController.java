package com.aureliagrand.hotel.controller;

import com.aureliagrand.hotel.dto.ErrorResponse;
import com.aureliagrand.hotel.dto.UserDto;
import com.aureliagrand.hotel.service.StaffApprovalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/staff-applications")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Staff Approvals", description = "Endpoints for executive review, approval, and rejection of hotel staff registration applications")
public class AdminStaffController {

    private final StaffApprovalService staffApprovalService;

    public AdminStaffController(StaffApprovalService staffApprovalService) {
        this.staffApprovalService = staffApprovalService;
    }

    @Operation(
            summary = "Get Staff Registration Applications",
            description = "Retrieve all staff applications, optionally filtered by status (PENDING, APPROVED, REJECTED, ALL). **Access: ADMIN only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Staff applications returned successfully",
                    content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = UserDto.class)))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: User lacks ADMIN role",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<UserDto>> getStaffApplications(
            @Parameter(description = "Filter by status: PENDING, APPROVED, REJECTED, or ALL", example = "PENDING")
            @RequestParam(required = false, defaultValue = "ALL") String status) {
        return ResponseEntity.ok(staffApprovalService.getStaffApplications(status));
    }

    @Operation(
            summary = "Approve Staff Application",
            description = "Approve a pending staff member account, activating their credentials for hotel operations access. **Access: ADMIN only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Staff account successfully approved and activated",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserDto.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request: Account is not in PENDING status or target is not staff",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: ADMIN privileges required",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Staff account record not found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @RequestMapping(value = "/{id}/approve", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<UserDto> approveStaff(
            @Parameter(description = "Numeric ID of the staff applicant", required = true, example = "2")
            @PathVariable Long id) {
        return ResponseEntity.ok(staffApprovalService.approveStaff(id));
    }

    @Operation(
            summary = "Reject Staff Application",
            description = "Reject a pending staff member account application. The applicant will not be allowed to authenticate. **Access: ADMIN only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Staff account successfully rejected",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserDto.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request: Account is not in PENDING status or target is not staff",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: ADMIN privileges required",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Staff account record not found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @RequestMapping(value = "/{id}/reject", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<UserDto> rejectStaff(
            @Parameter(description = "Numeric ID of the staff applicant", required = true, example = "2")
            @PathVariable Long id) {
        return ResponseEntity.ok(staffApprovalService.rejectStaff(id));
    }
}
