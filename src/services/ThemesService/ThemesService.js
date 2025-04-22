const { message } = require('telegraf/filters');
const {ContentResponse} = require('../../contracts/ThemesContracts');
const apiService = require('../ApiService/ApiService')

class ThemesService {

    async getThemes(tgId, themeId = null) {
        const params = {
            tgId: tgId
        };

        if (themeId) {
            params.themeId = themeId
        }

        const response = await apiService.get('/content/get', params);
        if (response.isSuccess()) {
            return {
                success: true,
                content: new ContentResponse(
                    response.data.leaf,
                    response.data.children,
                    response.data.instructions,
                    response.data.description,              
                )
            }
        }
        return {
            success: false,
            message: 'Не удалось получить список тем'
        }
    }

    async createTheme(createThemeRequest) {
        const params = {
            createDto: createThemeRequest
        };
        const response = await apiService.post('/theme/create', {
            themeName: createThemeRequest.themeName, 
            description: createThemeRequest.description, 
            parentId: createThemeRequest.parentId, 
            accessLevel: createThemeRequest.accessLevel
        });
        console.log(response);
        if (response.isSuccess()) {
            return { 
                success: true,
                createdThemeId: response.data.id
            }
        }
        return {
            success: false,
            message: 'Не удалось создать тему'
        }
    }

    async updateTheme(updateThemeRequest) {
        const params = {
            updateThemeDto: updateThemeRequest
        };
        const response = await apiService.post('/theme/update', params);
        if (response.isSuccess()) {
            return {
                success: true
            }
        }
        return {
            success: false,
            message: `Не удалось обновить тему ${updateThemeRequest.themeName} (id: ${updateThemeRequest.id})`
        }
    }

    async deleteTheme(id) {
        const params = {
            themeId: id
        };
        const response = await apiService.post('/theme/delete', params);
        if (response.isSuccess()) {
            return {
                success: true
            }
        }
        return {
            success: false,
            message: `Не удалось удалить тему (id: ${id})`
        }

    }
}

module.exports = new ThemesService();