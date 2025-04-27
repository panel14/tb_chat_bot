const apiService = require('../ApiService/ApiService')

class PositionsService {
    constructor() {
        this.basePath = 'position';
    }

    async create(text) {
        const response = apiService.post(`${this.basePath}/create`, `${text}`, {
            headers: {
                'Content-Type': 'text/plain'
            }
        });
        return response;
    }

    async update(id, text) {
        const params = {
            id: id,
            name: text
        }

        const response = apiService.post(`${this.basePath}/update`, params, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    }

    async delete(id) {
        const response = apiService.post(`${this.basePath}/delete`, id, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    }

    async list() {
        const response = apiService.get(`${this.basePath}/getAll`);
        return response;
    }
}

module.exports = new PositionsService();