const apiService = require('../ApiService/ApiService');
const storage = require('../Storage/StorageFactory')

class AuthService {

    async login(userId) {
        console.log(userId);
        const response = await apiService.post('login', `${userId}`, {
            headers: {
                'Content-Type': 'text/plain'
            }
        });
        if (response.isSuccess()) {
            storage.setItem('token', response.data);
            return true;
        }
        console.log(response)
        return false;    
    }
}

module.exports = new AuthService();

