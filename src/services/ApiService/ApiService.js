const httpClient = require('./axios');

class ApiService {

    async get(url, params) {
        try {
            return await httpClient.get(url, { params });
        } catch (error) {
            throw ApiResponse.error(-1, 'Неожиданная ошибка');
        }
    }

    async post(url, data = {}) {
        try {
            return await httpClient.post(url, data);
        } catch (error) {
            throw ApiResponse.error(-1, 'Неожиданная ошибка');
        }
    }
}

module.exports = new ApiService();
