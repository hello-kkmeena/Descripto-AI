package com.descripto.api;

import java.util.List;

/**
 * @author krishna.meena
 */
public class Constant {

    public static final String ACCESS_TOKEN_NAME="access_token";
    public static final String REFRESH_TOKEN_NAME = "refresh_token";
    public static final long MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
    public static final List<String> ALLOWED_EXTENSIONS = List.of(".xlsx", ".xls");



    private Constant() {
        super();
    }
}
