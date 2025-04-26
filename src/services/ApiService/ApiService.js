const httpClient = require('./axios');

class ApiService {

    async get(url, params = undefined, config = {}) {
        if (params) {
            config.params = params
        }
        return await httpClient.get(url, config);
    }

    async post(url, data = {}, config = {}) {
        return await httpClient.post(url, data, config);
    }
}

module.exports = new ApiService();
