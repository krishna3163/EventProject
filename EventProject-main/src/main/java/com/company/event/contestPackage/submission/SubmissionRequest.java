package com.company.event.contestPackage.submission;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SubmissionRequest {
    @NotBlank
    private String userId;
    @NotBlank
    private String contestId;
    @NotBlank
    private String problemId;
    @NotBlank
    private String code;
    @NotBlank
    private String language; // cpp java python c
}
