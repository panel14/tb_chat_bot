const apiService = require('../ApiService/ApiService')

class ThemesService {

    async getThemes(tgId, themeId = null) {
        const params = {
            tgId: tgId
        };

        if (themeId) {
            params.themeId = themeId
        }

        const response = await apiService.get('/content/get/', params);
        if (response.isSuccess()) {
            return {
                success: true,
                themes: response.data.children,
                instructions: response.data.instructions,
                description: response.data.description,
                leaf: response.data.leaf
            }
        }
        return {
            success: false,
            message: 'Не удалось получить список тем'
        }
    }
}

module.exports = new ThemesService();