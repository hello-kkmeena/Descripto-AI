package com.descripto.api.exception;

import java.awt.event.FocusEvent;
import java.lang.reflect.InaccessibleObjectException;

/**
 * @author krishna.meena
 */

public class InvalidChatException extends RuntimeException {

    public InvalidChatException(String message) {
        super(message);
    }

    public InvalidChatException(String message, Throwable c) {
        super(message,c);
    }
}
