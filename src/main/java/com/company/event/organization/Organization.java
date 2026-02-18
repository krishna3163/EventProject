package com.company.event.organization;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "organizations")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Organization {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String username;

    private String email;

    private String contactNumber;

    private String createdBy; // user id of the creator

    private Instant createdAt;

    private String description;

    private String logoUrl;

    private String website;
}
