export class UnauthorizedError extends Error {
    constructor(message: string = 'Unauthorized') {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends Error {
    constructor(message: string = 'Forbidden') {
        super(message);
        this.name = 'ForbiddenError';
    }
}

export class NotFoundError extends Error {
    constructor(message: string = 'Not Found') {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class ValidationError extends Error {
    constructor(message: string = 'Validation Error') {
        super(message);
        this.name = 'ValidationError';
    }
}

export class ConflictError extends Error {
    constructor(message: string = 'Conflict') {
        super(message);
        this.name = 'ConflictError';
    }
}

export class BadRequestError extends Error {
    constructor(message: string = 'Bad Request') {
        super(message);
        this.name = 'BadRequestError';
    }
}
