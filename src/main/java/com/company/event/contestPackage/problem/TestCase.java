package com.company.event.contestPackage.problem;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TestCase {
    private String input;
    private String expectedOutput;
    private boolean hidden;
}
