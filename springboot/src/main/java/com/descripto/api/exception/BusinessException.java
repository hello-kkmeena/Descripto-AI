package com.descripto.api.exception;

/**
 * Custom exception for business logic violations
 * 
 * @author Descripto Team
 */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
} 