import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../../config/logger';
import ResponseHandler from '../utils/response';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(`Error: ${err.message}`, { stack: err.stack });

    if (err instanceof AppError) {
        return ResponseHandler.error(res, err.message, err, err.statusCode);
    }

    // Default to 500 server error
    return ResponseHandler.error(res, 'Internal Server Error', err, 500);
};

export const notFoundHandler = (req: Request, res: Response) => {
    return ResponseHandler.error(res, `Route ${req.originalUrl} not found`, null, 404);
};
