const apiService = require('../ApiService/ApiService');

class AuthService {

    async login(userId) {
        const response = await apiService.post('/auth/login', { userId });
        if (response.isSuccess()) {
            localStorage.setItem('token', response.data);
            return true;
        }
        return false;
    }
}

module.exports = new AuthService();

