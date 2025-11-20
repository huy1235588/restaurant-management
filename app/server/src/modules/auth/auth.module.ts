import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AccountRepository } from './account.repository';
import { RefreshTokenRepository } from './refresh-token.repository';
import { StaffRepository } from '../staff/staff.repository';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            useFactory: (configService: ConfigService) => {
                const secret = configService.get<string>('JWT_SECRET');
                if (!secret) {
                    throw new Error('JWT secret is not configured');
                }
                return {
                    secret,
                    signOptions: {
                        expiresIn: '15m',
                        issuer: 'restaurant-management',
                        audience: 'restaurant-app',
                    },
                };
            },
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        AccountRepository,
        RefreshTokenRepository,
        StaffRepository,
    ],
    exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
