package com.aureliagrand.hotel.service;

import com.aureliagrand.hotel.dto.UserDto;
import com.aureliagrand.hotel.entity.AccountStatus;
import com.aureliagrand.hotel.entity.Role;
import com.aureliagrand.hotel.entity.User;
import com.aureliagrand.hotel.exception.BadRequestException;
import com.aureliagrand.hotel.exception.ResourceNotFoundException;
import com.aureliagrand.hotel.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StaffApprovalService {

    private final UserRepository userRepository;
    private final AuthService authService;

    public StaffApprovalService(UserRepository userRepository, AuthService authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    public List<UserDto> getStaffApplications(String statusFilter) {
        ensureAdminCaller();

        List<User> staffList;
        if (statusFilter != null && !statusFilter.isBlank() && !"ALL".equalsIgnoreCase(statusFilter)) {
            try {
                AccountStatus status = AccountStatus.valueOf(statusFilter.toUpperCase());
                staffList = userRepository.findByRoleAndStatus(Role.STAFF, status);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid account status filter: " + statusFilter);
            }
        } else {
            staffList = userRepository.findByRoleOrderByCreatedAtDesc(Role.STAFF);
        }

        return staffList.stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto approveStaff(Long staffId) {
        User admin = ensureAdminCaller();

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff account not found with ID: " + staffId));

        if (staff.getRole() != Role.STAFF) {
            throw new BadRequestException("Target user is not a staff account.");
        }

        if (staff.getId().equals(admin.getId())) {
            throw new BadRequestException("Administrators cannot review their own account.");
        }

        if (staff.getStatus() != AccountStatus.PENDING) {
            throw new BadRequestException("Only pending staff accounts can be reviewed. Current status is " + staff.getStatus());
        }

        staff.setStatus(AccountStatus.APPROVED);
        staff.setActive(true);
        User updated = userRepository.save(staff);

        return new UserDto(updated);
    }

    @Transactional
    public UserDto rejectStaff(Long staffId) {
        User admin = ensureAdminCaller();

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff account not found with ID: " + staffId));

        if (staff.getRole() != Role.STAFF) {
            throw new BadRequestException("Target user is not a staff account.");
        }

        if (staff.getId().equals(admin.getId())) {
            throw new BadRequestException("Administrators cannot review their own account.");
        }

        if (staff.getStatus() != AccountStatus.PENDING) {
            throw new BadRequestException("Only pending staff accounts can be reviewed. Current status is " + staff.getStatus());
        }

        staff.setStatus(AccountStatus.REJECTED);
        staff.setActive(false);
        User updated = userRepository.save(staff);

        return new UserDto(updated);
    }

    private User ensureAdminCaller() {
        User caller = authService.getCurrentAuthenticatedUser();
        if (caller.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only administrative users can perform staff approvals.");
        }
        return caller;
    }
}
