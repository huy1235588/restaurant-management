import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from '@/shared/types';

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): TokenPayload => {
        const request = ctx.switchToHttp().getRequest<{ user: TokenPayload }>();
        return request.user;
    },
);
