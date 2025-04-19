const apiService = require('../ApiService/ApiService')

class InstructionsService {

    async getInstructions() {
        const response = await apiService.get('/api/instructions');
        if (response.isSuccess()) {

            return {
                success: true,
                themes: response.data
            }
        }
        return {
            success: false,
            message: 'Не удалось получить список инструкций'
        }
    }
}

module.exports = new InstructionsService();