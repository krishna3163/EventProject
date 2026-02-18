package com.company.event.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentRegisterRequest {
    private String name;
    private String email;
    private String password;
    private String college;
    private String phone;
    // Optional legacy fields
    private String username;
    private String firstName;
    private String lastName;
    private String course;
    private String branch;
    private String firebaseUid;
}
