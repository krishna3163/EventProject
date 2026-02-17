package com.company.event.user;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private String id;
    private String username;
    private String password;
    private String email;
    private Roles role;
    private String firstName;
    private String lastName;
    private String fatherName;
    private String course;
    private String branch;
}
