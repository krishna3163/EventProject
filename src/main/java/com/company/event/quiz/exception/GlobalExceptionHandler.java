package com.company.event.quiz.exception;

import com.company.event.quiz.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ==========================
    // 404 - Event Not Found
    // ==========================
    @ExceptionHandler(EventNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEventNotFound(EventNotFoundException ex) {

        ErrorResponse error = new ErrorResponse(
                Instant.now(),
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                ex.getMessage()
        );

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    // ==========================
    // 400 - Test Already Submitted
    // ==========================
    @ExceptionHandler(TestAlreadySubmittedException.class)
    public ResponseEntity<ErrorResponse> handleAlreadySubmitted(TestAlreadySubmittedException ex) {

        ErrorResponse error = new ErrorResponse(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage()
        );

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    // ==========================
    // 400 - Test Not Started
    // ==========================
    @ExceptionHandler(TestNotStartedException.class)
    public ResponseEntity<ErrorResponse> handleTestNotStarted(TestNotStartedException ex) {

        ErrorResponse error = new ErrorResponse(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage()
        );

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    // ==========================
    // 400 - Illegal Argument
    // ==========================
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {

        ErrorResponse error = new ErrorResponse(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage()
        );

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    // ==========================
    // 400 - Illegal State
    // ==========================
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex) {

        ErrorResponse error = new ErrorResponse(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage()
        );

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    // ==========================
    // 500 - Fallback
    // ==========================
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {

        ErrorResponse error = new ErrorResponse(
                Instant.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Something went wrong"
        );

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
