package com.company.event.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User insertUser(UserRequest userRequest) {
        User user = new User();
        user.setEmail(userRequest.getEmail());
        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());

        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));

        user.setBranch(userRequest.getBranch());
        user.setCourse(userRequest.getCourse());
        user.setFatherName(userRequest.getFatherName());
        user.setUsername(userRequest.getUsername());

        if (user.getRole() == null) {
            user.setRole(Roles.USER);
        }

        try {
            return userRepository.save(user);
        } catch (Exception e) {
            throw new IllegalStateException("Could not save user", e);
        }
    }

    public UserResponse getUserById(String id) {
        return userRepository.findById(id)
                .map(this::mapToResponse)
                .orElse(null);
    }

    public List<UserResponse> getAllUsers() {

        List<User> users = userRepository.findAll();
        List<UserResponse> userResponseList = new ArrayList<>();

        for (User user : users) {
            userResponseList.add(mapToResponse(user));
        }

        return userResponseList;
    }

    public boolean deleteUserById(String id) {

        if (!userRepository.existsById(id)) {
            return false;
        }

        userRepository.deleteById(id);
        return true;
    }

    public UserResponse updateUser(UserRequest userRequest, String id) {

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return null;
        }

        user.setEmail(userRequest.getEmail());
        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());

        if (userRequest.getPassword() != null &&
                !userRequest.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        }

        user.setBranch(userRequest.getBranch());
        user.setCourse(userRequest.getCourse());
        user.setFatherName(userRequest.getFatherName());
        user.setUsername(userRequest.getUsername());
        user.setCollege(userRequest.getCollege());
        user.setRollNumber(userRequest.getRollNumber());
        user.setAcademicYear(userRequest.getAcademicYear());

        userRepository.save(user);

        return mapToResponse(user);
    }

    private UserResponse mapToResponse(User user) {

        UserResponse userResponse = new UserResponse();
        userResponse.setEmail(user.getEmail());
        userResponse.setFirstName(user.getFirstName());
        userResponse.setLastName(user.getLastName());
        userResponse.setBranch(user.getBranch());
        userResponse.setCourse(user.getCourse());
        userResponse.setFatherName(user.getFatherName());
        userResponse.setUsername(user.getUsername());
        userResponse.setId(user.getId());
        userResponse.setRole(user.getRole());
        userResponse.setCollege(user.getCollege());
        userResponse.setRollNumber(user.getRollNumber());
        userResponse.setAcademicYear(user.getAcademicYear());
        userResponse.setPhone(user.getPhone());

        userResponse.setPassword(null);

        return userResponse;
    }

    public UserResponse patchUserProfile(String id, Map<String, String> fields) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null)
            return null;

        fields.forEach((key, value) -> {
            switch (key) {
                case "username" -> user.setUsername(value);
                case "firstName" -> user.setFirstName(value);
                case "lastName" -> user.setLastName(value);
                case "email" -> user.setEmail(value);
                case "branch" -> user.setBranch(value);
                case "college" -> user.setCollege(value);
                case "rollNumber" -> user.setRollNumber(value);
                case "academicYear" -> user.setAcademicYear(value);
                case "course" -> user.setCourse(value);
                case "phone" -> user.setPhone(value);
            }
        });

        userRepository.save(user);
        return mapToResponse(user);
    }
}
