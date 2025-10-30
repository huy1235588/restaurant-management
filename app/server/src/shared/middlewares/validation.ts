import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export const validate = (schema: ZodSchema) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
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
