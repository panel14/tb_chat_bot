class BaseError extends Error {
    constructor(message, status) {
        super(message),
        this.statusCode = status;
    }
}

class ApiError extends BaseError { 
    constructor(message, status = 500) {
        super(message, status);
    }
}

class NotFoundError extends BaseError {
    constructor(message, status = 404) {
        super(message, status);
    }
}

class AuthenticationError extends BaseError {
    constructor(message, status = 401) {
        super(message, status);
    }
}

class ValidationError extends BaseError {
    constructor(message, status = 400) {
        super(message, status)
    }
}

module.exports = {
    BaseError,
    ApiError,
    AuthenticationError,
    ValidationError,
    NotFoundError
}