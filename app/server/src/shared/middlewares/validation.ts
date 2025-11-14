import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export const validate = (schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const dataToValidate = source === 'body' ? req.body : 
                                   source === 'params' ? req.params : 
                                   req.query;
            await schema.parseAsync(dataToValidate);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const messages = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
                next(new ValidationError(messages.join(', ')));
            } else {
                next(error);
            }
        }
    };
};
