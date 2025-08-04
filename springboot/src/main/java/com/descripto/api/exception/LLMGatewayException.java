package com.descripto.api.exception;

/**
 * @author krishna.meena
 */

public class LLMGatewayException extends RuntimeException {

    public LLMGatewayException(String message) {
        super(message);
    }

    public LLMGatewayException(String message, Throwable cause) {
        super(message, cause);
    }
}
