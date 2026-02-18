package com.company.event.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrgRegisterRequest {
    private String organizationName;
    private String organizationUsername;
    private String email;
    private String password;
    private String contactNumber;
    // Admin user name
    private String adminName;
    private String firebaseUid;
}
