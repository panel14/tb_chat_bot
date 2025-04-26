const apiService = require('../ApiService/ApiService');
const storage = require('../Storage/StorageFactory')

class AuthService {

    async login(userId) {
        const response = await apiService.post('login', `${userId}`, {
            headers: {
                'Content-Type': 'text/plain'
            }
        });
        storage.setItem('token', response.accessToken);
        return response.role;
    }
}

module.exports = new AuthService();

