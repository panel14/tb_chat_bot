const httpClient = require('./axios');

class ApiService {

    async get(url, params) {
        return await httpClient.get(url, { params });
    }

    async post(url, data = {}, config = {}) {
        return await httpClient.post(url, data, config);
    }
}

module.exports = new ApiService();
