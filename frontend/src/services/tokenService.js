class TokenService {
    static ACCESS_TOKEN_KEY = 'access_token';
    static REFRESH_TOKEN_KEY = 'refresh_token';

    static setTokens(accessToken, refreshToken) {
        try {
            if (accessToken) {
                localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
            }
            if (refreshToken) {
                localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
            }
        } catch (error) {
            console.error('Error storing tokens:', error);
        }
    }

    static getAccessToken() {
        try {
            return localStorage.getItem(this.ACCESS_TOKEN_KEY);
        } catch (error) {
            console.error('Error reading access token:', error);
            return null;
        }
    }

    static getRefreshToken() {
        try {
            return localStorage.getItem(this.REFRESH_TOKEN_KEY);
        } catch (error) {
            console.error('Error reading refresh token:', error);
            return null;
        }
    }

    static clearTokens() {
        try {
            localStorage.removeItem(this.ACCESS_TOKEN_KEY);
            localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        } catch (error) {
            console.error('Error clearing tokens:', error);
        }
    }
}

export default TokenService; 