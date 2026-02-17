package com.company.event.quiz.exception;

public class TestAlreadySubmittedException extends RuntimeException {
    public TestAlreadySubmittedException(String message) {
        super(message);
    }
}
