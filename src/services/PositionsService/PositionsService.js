const apiService = require('../ApiService/ApiService')

class PositionsService {
    constructor() {
        this.basePath = 'position';
    }

    async create(text) {
        const response = apiService.post(`${this.basePath}/create`, `${text}`);
        return response;
    }

    async update(id, text) {
        const params = {
            id: id,
            text: text
        }

        const response = apiService.post(`${this.basePath}/update`, params);
        return response;
    }

    async delete(id) {
        console.log('-----------------------------------------', id);
        const response = apiService.post(`${this.basePath}/delete`, `${id}`);
        return response;
    }

    async list() {
        const response = apiService.get(`${this.basePath}/getAll`);
        return response;
    }
}

module.exports = new PositionsService();