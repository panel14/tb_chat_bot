const axios = require('axios');
const ApiResponse = require('./ApiContracts');

const httpClient = axios.create({
    baseURL: process.env.API_BASE_URL,
    timeout: 5000,
});

httpClient.interceptors.response.use(
    (response) => {
        return ApiResponse.success(response.data);
    },
    (error) => {
        if (error.response) {
            return Promise.resolve(
                ApiResponse.error(
                    error.response.status,
                     error.response.data?.message || 'Ошибка сервера'
                    )
            );
        } else if (error.request) {
            return Promise.resolve(
                ApiResponse.error(500, 'Ошибка сети: ' + error.message)
            );
        } else {
            return Promise.resolve(
                ApiResponse.error(500, 'Системная ошибка: ' + error.message)
            );
        }
    }
);

module.exports = httpClient;
