import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ValidationError,
    ConflictError,
    BadRequestError,
} from '@/common/errors';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';

        // Handle HttpException
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (
                typeof exceptionResponse === 'object' &&
                exceptionResponse !== null
            ) {
                const responseObj = exceptionResponse as {
                    message?: string | string[];
                };
                const responseMessage = responseObj.message;
                if (Array.isArray(responseMessage)) {
                    message = responseMessage.join(', ');
                } else if (typeof responseMessage === 'string') {
                    message = responseMessage;
                } else {
                    message = exception.message;
                }
            } else {
                message = exception.message;
            }
        }
        // Handle custom errors
        else if (exception instanceof UnauthorizedError) {
            status = HttpStatus.UNAUTHORIZED;
            message = exception.message;
        } else if (exception instanceof ForbiddenError) {
            status = HttpStatus.FORBIDDEN;
            message = exception.message;
        } else if (exception instanceof NotFoundError) {
            status = HttpStatus.NOT_FOUND;
            message = exception.message;
        } else if (exception instanceof ValidationError) {
            status = HttpStatus.BAD_REQUEST;
            message = exception.message;
        } else if (exception instanceof ConflictError) {
            status = HttpStatus.CONFLICT;
            message = exception.message;
        } else if (exception instanceof BadRequestError) {
            status = HttpStatus.BAD_REQUEST;
            message = exception.message;
        }
        // Handle generic Error
        else if (exception instanceof Error) {
            message = exception.message;
            this.logger.error(
                `Unhandled error: ${exception.message}`,
                exception.stack,
            );
        }

        // Log the error
        if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(
                `HTTP ${status} Error: ${message}`,
                exception instanceof Error ? exception.stack : undefined,
            );
        } else {
            this.logger.warn(`HTTP ${status} Error: ${message}`);
        }

        // Send response
        const request = ctx.getRequest<{ url: string }>();
        response.status(status).json({
            success: false,
            statusCode: status,
            message: Array.isArray(message) ? message : [message],
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
