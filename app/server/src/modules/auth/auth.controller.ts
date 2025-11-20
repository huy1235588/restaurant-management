import {
    Controller,
    Post,
    Get,
    Body,
    Req,
    Res,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '@/modules/auth/auth.service';
import {
    LoginDto,
    RegisterDto,
    CreateStaffWithAccountDto,
} from '@/modules/auth/dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { JwtPayload } from '@/modules/auth/strategies/jwt.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    private getCookieOptions(maxAge: number) {
        const isProduction =
            this.configService.get<string>('NODE_ENV') === 'production';
        return {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? ('strict' as const) : ('lax' as const),
            path: '/',
            maxAge,
        };
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User login' })
    @ApiResponse({ status: 200, description: 'Login successful' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(
        @Body() loginDto: LoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        // Get device info and IP
        const deviceInfo = req.headers['user-agent'];
        const ipAddress =
            (req.headers['x-forwarded-for'] as string) ||
            req.socket.remoteAddress;

        const result = await this.authService.login(
            loginDto,
            deviceInfo,
            ipAddress,
        );

        // Set access token cookie (short-lived)
        res.cookie(
            'accessToken',
            result.accessToken,
            this.getCookieOptions(15 * 60 * 1000), // 15 minutes
        );

        // Set refresh token cookie (long-lived)
        res.cookie(
            'refreshToken',
            result.refreshToken,
            this.getCookieOptions(7 * 24 * 60 * 60 * 1000), // 7 days
        );

        // Return user info only (tokens are in cookies)
        return {
            message: 'Login successful',
            data: {
                user: result.user,
                accessToken: result.accessToken, // For client-side storage (optional)
            },
        };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user info' })
    @ApiResponse({
        status: 200,
        description: 'User info retrieved successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getMe(@CurrentUser() user: JwtPayload) {
        const userInfo = await this.authService.getUserInfo(user.accountId);
        return {
            message: 'User info retrieved successfully',
            data: userInfo,
        };
    }

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register new user (admin only)' })
    @ApiResponse({ status: 201, description: 'Account created successfully' })
    @ApiResponse({
        status: 409,
        description: 'Username/Email/Phone already exists',
    })
    async register(@Body() registerDto: RegisterDto) {
        const result = await this.authService.register(registerDto);
        return {
            message: 'Account created successfully',
            data: result,
        };
    }

    @Public()
    @Post('staff')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create staff with account' })
    @ApiResponse({ status: 201, description: 'Staff created successfully' })
    @ApiResponse({
        status: 409,
        description: 'Username/Email/Phone already exists',
    })
    async createStaff(@Body() createStaffDto: CreateStaffWithAccountDto) {
        const result = await this.authService.createStaff(createStaffDto);
        return {
            message: 'Staff created successfully',
            data: result,
        };
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    async refreshToken(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies['refreshToken'] as string;

        if (!refreshToken) {
            throw new Error('No refresh token provided');
        }

        const result = await this.authService.refreshToken(refreshToken);

        // Set new access token cookie
        res.cookie(
            'accessToken',
            result.accessToken,
            this.getCookieOptions(15 * 60 * 1000), // 15 minutes
        );

        return {
            message: 'Token refreshed successfully',
            data: {
                accessToken: result.accessToken,
            },
        };
    }

    @Public()
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Logout user' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies['refreshToken'] as string;

        // Revoke refresh token
        await this.authService.logout(refreshToken);

        // Clear all auth cookies
        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });

        return {
            message: 'Logout successful',
        };
    }

    @Post('logout-all')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout from all devices' })
    @ApiResponse({ status: 200, description: 'Logged out from all devices' })
    async logoutAll(
        @CurrentUser() user: JwtPayload,
        @Res({ passthrough: true }) res: Response,
    ) {
        await this.authService.logoutAll(user.accountId);

        // Clear cookies
        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });

        return {
            message: 'Logged out from all devices',
        };
    }
}
