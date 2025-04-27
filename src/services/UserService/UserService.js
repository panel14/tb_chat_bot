const apiService = require('../ApiService/ApiService')

class UserService {

    async createOrUpdateUser(user) {
        console.log(user);
        const result = await apiService.post('/user/createOrUpdate', {
            tgId: `${user.id}`,
            fullName: user.fullName,
            positionId: user.positionId,
            roleId: user.roleId
        });
        return result;
    }

    async blockUser(user) {
        const result = await apiService.post('/user/block', {
            tgId: user.id,
            archived: user.archived
        });
        return result;
    }
}

module.exports = new UserService();