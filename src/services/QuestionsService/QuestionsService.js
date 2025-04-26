const apiService = require('../ApiService/ApiService')

class QuestionsService {

    async getQuestions() {
        const data = await apiService.get('/api/questions');
        return data;
    }
}

module.exports = new QuestionsService();