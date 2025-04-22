class ApiError { 
    constructor(status, message) {
        this.status = status;
        this.message = message;
    }
}

class ApiResponse {
    constructor(success, data = null, error = null) {
        this.success = success;
        this.data = data;
        this.error = error
    }

    static success(data) {
        return new ApiResponse(true, data, null);
    }

    static error(status, message) {
        return new ApiResponse(false, null, new ApiError(status, message));
    }

    isSuccess() {
        return this.success;
    }

    isError() {
        return !this.success;
    }
}

module.exports = { 
    ApiResponse,
    ApiError
} ;
