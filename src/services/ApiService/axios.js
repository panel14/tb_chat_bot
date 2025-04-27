require('dotenv').config();
const axios = require('axios');
const { ApiError, AuthenticationError } = require('../../middlewares/errors/Errors')
const storage = require('../Storage/StorageFactory');

const httpClient = axios.create({
    baseURL: process.env.API_BASE_URL,
    timeout: 5000,
});

httpClient.interceptors.request.use(
    (config) => {
        const token = storage.getItem('token');
        if (token) {
            config.headers.Authorization = token;
        }       
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

httpClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response) {
            if (error.response?.status == 401 || error.response?.status == 403)
                return Promise.reject(new AuthenticationError('Ошибка авторизации.', error.response.status));
            return Promise.reject(
                new ApiError(
                    error.response.data?.message || 'Ошибка сервера.',
                    error.response.status
                )
            );
        } else if (error.request) {
            return Promise.reject(
                new ApiError('Ошибка сети: ' + error.message, 500)
            );
        } else {
            return Promise.reject(
                new ApiError('Системная ошибка: ' + error.message, error.response?.status ?? 500)
            );
        }
    }
);

module.exports = httpClient;
