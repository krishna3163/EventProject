package com.company.event.contestPackage.contest;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "contests")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Contest {
    @Id
    private String id;
    private String title;
    private Instant startTime;
    private Instant endTime;
    private List<String> problemIds;
}
