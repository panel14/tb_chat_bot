const apiService = require('../ApiService/ApiService')

class InstructionsService {

    async getInstructions() {
        const data = await apiService.get('/api/instructions');
        return data;
    }
}

module.exports = new InstructionsService();