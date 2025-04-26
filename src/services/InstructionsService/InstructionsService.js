const apiService = require('../ApiService/ApiService')

class InstructionsService {

    async addInstructionsToTheme(data) {
        const response = apiService.post('/content/addInstructionToTheme', {
            authorTgId: data.authorTgId,
            themeId: data.themeId,
            instructions: data.instructions.map(i => {
                return {
                    typeId: i.typeId,
                    content: Array.from(i.content)
                }
            })
        });
        return response;
    }
}

module.exports = new InstructionsService();