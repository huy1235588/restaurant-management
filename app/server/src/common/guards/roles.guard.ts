import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { ForbiddenError, UnauthorizedError } from '@/common/errors';
import { TokenPayload } from '@/shared/types';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles) {
            return true;
        }

        const request = context
            .switchToHttp()
            .getRequest<{ user?: TokenPayload }>();
        const user: TokenPayload | undefined = request.user;

        if (!user) {
            throw new UnauthorizedError('Authentication required');
        }

        const hasRole = requiredRoles.some(
            (role) => role.toLowerCase() === user.role.toLowerCase(),
        );

        if (!hasRole) {
            throw new ForbiddenError(
                `Access denied. Required role(s): ${requiredRoles.join(', ')}. Your role: ${user.role}`,
            );
        }

        return true;
    }
}
