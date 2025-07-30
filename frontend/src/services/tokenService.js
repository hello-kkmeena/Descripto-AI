class TokenService {
    // We don't need to set cookies directly as they are handled by the server
    static setTokens(accessToken, refreshToken) {
        // No-op as cookies are set by the server
    }

    static clearTokens() {
        // No-op as cookies are cleared by the server during logout
    }
}

export default TokenService; 