class UserService {
    static PROFILE_KEY = 'user_profile';
    static REFRESH_RETRY_LIMIT = 3;
    static refreshRetryCount = 0;

    static setProfile(profile) {
        if (!profile) return;
        try {
            localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
        } catch (error) {
            console.error('Error saving profile to localStorage:', error);
        }
    }

    static getProfile() {
        try {
            const profile = localStorage.getItem(this.PROFILE_KEY);
            return profile ? JSON.parse(profile) : null;
        } catch (error) {
            console.error('Error reading profile from localStorage:', error);
            return null;
        }
    }

    static clearProfile() {
        try {
            localStorage.removeItem(this.PROFILE_KEY);
        } catch (error) {
            console.error('Error clearing profile from localStorage:', error);
        }
    }

    static resetRefreshCount() {
        this.refreshRetryCount = 0;
    }

    static incrementRefreshCount() {
        this.refreshRetryCount += 1;
        return this.refreshRetryCount;
    }

    static hasValidProfile() {
        const profile = this.getProfile();
        return profile !== null && Object.keys(profile).length > 0;
    }
}

export default UserService; 