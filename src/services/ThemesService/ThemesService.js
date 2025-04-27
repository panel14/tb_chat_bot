const { message } = require('telegraf/filters');
const apiService = require('../ApiService/ApiService');
const { NotFoundError } = require('../../middlewares/errors/Errors');

class ThemesService {

    async getThemes(tgId, themeId = null) {
        const params = {
            tgId: tgId
        };

        if (themeId) {
            params.themeId = themeId
        }

        const data = await apiService.get('/content/get', params);
        if (!data)
            throw new NotFoundError('Не удалось получить список тем');

        return data;
    }

    async createTheme(createThemeRequest) {

        const data = await apiService.post('/theme/create', {
            themeName: createThemeRequest.name,
            description: createThemeRequest.description,
            parentId: createThemeRequest.parentId,
            accessLevel: createThemeRequest.accessLevel
        });

        return data;
    }

    async updateTheme(updateThemeRequest) {
        const data = await apiService.post('/theme/update', {
            id: updateThemeRequest.id,
            themeName: updateThemeRequest.name,
            description: updateThemeRequest.description,
            parentId: updateThemeRequest.parentId,
            accessLevel: updateThemeRequest.accessLevel
        });
        return data;
    }

    async deleteTheme(id) {
        const data = await apiService.post('/theme/deleteById', JSON.stringify(id), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return data;
    }
}

module.exports = new ThemesService();