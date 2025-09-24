package com.descripto.api.exception;

/**
 * Custom exception for Excel processing errors
 * 
 * @author Descripto Team
 */
public class ExcelProcessingException extends RuntimeException {
    
    public ExcelProcessingException(String message) {
        super(message);
    }
    
    public ExcelProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}
