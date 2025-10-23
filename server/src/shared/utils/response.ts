import { Response } from 'express';
import { ApiResponse as ApiResponseType } from '@/shared/types';

export class ResponseHandler {
    static success<T>(res: Response, message: string, data?: T, statusCode: number = 200): Response {
        const response: ApiResponseType<T> = {
            success: true,
            message,
            data,
        };
        return res.status(statusCode).json(response);
    }

    static error(res: Response, message: string, error?: any, statusCode: number = 500): Response {
        const response: ApiResponseType = {
            success: false,
            message,
            error: process.env['NODE_ENV'] === 'development' ? error : undefined,
        };
        return res.status(statusCode).json(response);
    }

    static created<T>(res: Response, message: string, data?: T): Response {
        return this.success(res, message, data, 201);
    }

    static noContent(res: Response): Response {
        return res.status(204).send();
    }
}

// Helper class for JSON responses (used in controllers)
export class ApiResponse {
    static success<T>(data: T, message: string = 'Success'): ApiResponseType<T> {
        return {
            success: true,
            message,
            data,
        };
    }

    static error(message: string, error?: any): ApiResponseType {
        return {
            success: false,
            message,
            error: process.env['NODE_ENV'] === 'development' ? error : undefined,
        };
    }
}

export default ResponseHandler;
