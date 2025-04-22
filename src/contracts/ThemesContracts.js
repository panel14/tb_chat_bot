class ContentResponse {
    constructor(leaf, themes = [], instructions = [], description = null) {
        this.leaf = leaf,
        this.themes = themes,
        this.instructions = instructions,
        this.description = description
    }
}

class CreateThemeRequest {
    constructor(themeName, description, parentId, accessLevel) {
        this.themeName = themeName,
        this.description = description,
        this.parentId = parentId,
        this.accessLevel = accessLevel
    }
}

class UpdateThemeRequest {
    constructor(id, themeName, description, parentId, accessLevel) {
        this.id = id,
        this.themeName = themeName,
        this.description = description,
        this.parentId = parentId,
        this.accessLevel = accessLevel
    }
}

module.exports = {
    ContentResponse,
    CreateThemeRequest,
    UpdateThemeRequest
};