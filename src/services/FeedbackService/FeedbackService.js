const config = require('../../config/config');
const apiService = require('../ApiService/ApiService');

class QuestionService {
    constructor() {
        this.baseUrl = `faq`;
    }

    async create(tgId, question) {
        const params = {
            tgId,
            question
        }
        const response = await apiService.post(`${this.baseUrl}/create`, params);
        return response;
    }

    async list(tgId, answered) {
        const params = {
            tgId,
            answered
        }
        const response = await apiService.post(`${this.baseUrl}/getAllMy`, params);
        return response;
    }

    async getForAnswer(tgId) {
        const response = await apiService.post(`${this.baseUrl}/getForAnswer`, `${tgId}`, {
            headers: {
                'Content-Type': 'text/plain'
            }
        });
        return response;
    }

    async answerQuestion(questionId, answer, responderId) {
        const params = {
            questionId,
            answer,
            responderId
        }
        const response = await apiService.post(`${this.baseUrl}/answer`, params);
        return response;
    }
}

module.exports = new QuestionService();