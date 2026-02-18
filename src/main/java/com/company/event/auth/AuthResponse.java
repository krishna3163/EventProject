package com.company.event.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String organizationId;
}
