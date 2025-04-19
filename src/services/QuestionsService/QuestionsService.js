const apiService = require('../ApiService/ApiService')

class QuestionsService {

    async getQuestions() {
        const response = await apiService.get('/api/questions');
        if (response.isSuccess()) {

            return {
                success: true,
                themes: response.data
            }
        }
        return {
            success: false,
            message: 'Не удалось получить список вопросов'
        }
    }
}

module.exports = new QuestionsService();