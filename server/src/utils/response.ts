import { Response } from 'express';
import { ApiResponse } from '@/types/index';

export class ResponseHandler {
    static success<T>(res: Response, message: string, data?: T, statusCode: number = 200): Response {
        const response: ApiResponse<T> = {
            success: true,
            message,
            data,
        };
        return res.status(statusCode).json(response);
    }

    static error(res: Response, message: string, error?: any, statusCode: number = 500): Response {
        const response: ApiResponse = {
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

export default ResponseHandler;
