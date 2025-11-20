import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccountRepository } from '@/modules/auth/account.repository';
import { RefreshTokenRepository } from '@/modules/auth/refresh-token.repository';
import { AuthUtils, TokenPayload } from '@/modules/auth/auth.utils';
import { LoginDto, RegisterDto, CreateStaffDto } from '@/modules/auth/dto';
import { Prisma } from '@prisma/client';
import { StaffRepository } from '@/modules/staff/staff.repository';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly accountRepository: AccountRepository,
        private readonly refreshTokenRepository: RefreshTokenRepository,
        private readonly staffRepository: StaffRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    /**
     * User login
     */
    async login(data: LoginDto, deviceInfo?: string, ipAddress?: string) {
        const { username, password } = data;

        // Find account
        const account = await this.accountRepository.findByUsername(username);
        if (!account) {
            throw new UnauthorizedException('Invalid username or password');
        }

        if (!account.isActive) {
            throw new UnauthorizedException('Account is inactive');
        }

        // Verify password
        const isPasswordValid = await AuthUtils.comparePassword(
            password,
            account.password,
        );
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid username or password');
        }

        // Get staff info
        const staff = await this.staffRepository.findByAccountId(
            account.accountId,
        );
        if (!staff) {
            throw new NotFoundException('Staff profile not found');
        }

        // Update last login
        await this.accountRepository.updateLastLogin(account.accountId);

        // Generate tokens
        const tokenPayload: TokenPayload = {
            accountId: account.accountId,
            staffId: staff.staffId,
            username: account.username,
            role: staff.role,
        };

        const jwtExpiresIn =
            this.configService.get<string>('jwtExpiresIn') || '15m';
        const jwtRefreshExpiresIn =
            this.configService.get<string>('jwtRefreshExpiresIn') || '7d';

        const { accessToken, refreshToken } = AuthUtils.generateAuthTokens(
            this.jwtService,
            tokenPayload,
            jwtExpiresIn,
            jwtRefreshExpiresIn,
        );

        // Store refresh token in database
        await this.refreshTokenRepository.create({
            account: {
                connect: { accountId: account.accountId },
            },
            token: refreshToken,
            expiresAt: AuthUtils.getTokenExpirationDate(jwtRefreshExpiresIn),
            deviceInfo,
            ipAddress,
        });

        this.logger.log(`User ${username} logged in successfully`);

        return {
            user: {
                accountId: account.accountId,
                staffId: staff.staffId,
                username: account.username,
                email: account.email,
                fullName: staff.fullName,
                role: staff.role,
            },
            accessToken,
            refreshToken,
        };
    }

    /**
     * Get user info by account ID
     */
    async getUserInfo(accountId: number) {
        const account = await this.accountRepository.findById(accountId);
        if (!account) {
            throw new NotFoundException('Account not found');
        }

        const staff = await this.staffRepository.findByAccountId(accountId);
        if (!staff) {
            throw new NotFoundException('Staff profile not found');
        }

        return {
            accountId: account.accountId,
            staffId: staff.staffId,
            username: account.username,
            email: account.email,
            phoneNumber: account.phoneNumber,
            fullName: staff.fullName,
            role: staff.role,
            isActive: account.isActive,
            lastLogin: account.lastLogin,
        };
    }

    /**
     * Register new user (admin only)
     */
    async register(data: RegisterDto) {
        // Check if username exists
        const existingUsername = await this.accountRepository.findByUsername(
            data.username,
        );
        if (existingUsername) {
            throw new ConflictException('Username already exists');
        }

        // Check if email exists
        const existingEmail = await this.accountRepository.findByEmail(
            data.email,
        );
        if (existingEmail) {
            throw new ConflictException('Email already exists');
        }

        // Check if phone exists
        const existingPhone = await this.accountRepository.findByPhoneNumber(
            data.phoneNumber,
        );
        if (existingPhone) {
            throw new ConflictException('Phone number already exists');
        }

        // Hash password
        const hashedPassword = await AuthUtils.hashPassword(data.password);

        // Create account
        const account = await this.accountRepository.create({
            username: data.username,
            email: data.email,
            phoneNumber: data.phoneNumber,
            password: hashedPassword,
        });

        this.logger.log(`Account ${data.username} registered successfully`);

        return {
            accountId: account.accountId,
            username: account.username,
            email: account.email,
        };
    }

    /**
     * Create staff with account
     */
    async createStaff(data: CreateStaffDto) {
        // Check if username exists
        const existingUsername = await this.accountRepository.findByUsername(
            data.username,
        );
        if (existingUsername) {
            throw new ConflictException('Username already exists');
        }

        // Check if email exists
        const existingEmail = await this.accountRepository.findByEmail(
            data.email,
        );
        if (existingEmail) {
            throw new ConflictException('Email already exists');
        }

        // Check if phone exists
        const existingPhone = await this.accountRepository.findByPhoneNumber(
            data.phoneNumber,
        );
        if (existingPhone) {
            throw new ConflictException('Phone number already exists');
        }

        // Hash password
        const hashedPassword = await AuthUtils.hashPassword(data.password);

        // Create staff with account
        const staffData: Prisma.StaffCreateInput = {
            fullName: data.fullName,
            address: data.address,
            dateOfBirth: data.dateOfBirth
                ? new Date(data.dateOfBirth)
                : undefined,
            hireDate: data.hireDate ? new Date(data.hireDate) : new Date(),
            salary: data.salary,
            role: data.role,
            account: {
                create: {
                    username: data.username,
                    email: data.email,
                    phoneNumber: data.phoneNumber,
                    password: hashedPassword,
                },
            },
        };

        const staff = await this.staffRepository.create(staffData);

        this.logger.log(`Staff ${data.username} created successfully`);

        return {
            staffId: staff.staffId,
            accountId: staff.accountId,
            fullName: staff.fullName,
            role: staff.role,
        };
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string) {
        try {
            // Verify token format
            const decoded = this.jwtService.verify<TokenPayload>(refreshToken, {
                secret: this.configService.get<string>('jwtSecret'),
                issuer: 'restaurant-management',
                audience: 'restaurant-app',
            });

            // Check if refresh token exists and is valid in database
            const storedToken =
                await this.refreshTokenRepository.findByToken(refreshToken);
            if (!storedToken) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            // Verify account still exists and is active
            const account = storedToken.account;
            if (!account || !account.isActive) {
                throw new UnauthorizedException(
                    'Account is inactive or not found',
                );
            }

            // Generate new access token
            const tokenPayload: TokenPayload = {
                accountId: decoded.accountId,
                staffId: decoded.staffId,
                username: decoded.username,
                role: decoded.role,
            };

            const jwtExpiresIn =
                this.configService.get<string>('jwtExpiresIn') || '15m';
            const accessToken = AuthUtils.generateToken(
                this.jwtService,
                tokenPayload,
                jwtExpiresIn,
            );

            return { accessToken };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }

    /**
     * Logout user
     */
    async logout(refreshToken?: string) {
        if (refreshToken) {
            try {
                // Revoke refresh token from database
                await this.refreshTokenRepository.deleteByToken(refreshToken);
                this.logger.log('User logged out successfully');
            } catch (error) {
                // Log and ignore errors during logout
                this.logger.debug('Ignored error during logout', error);
            }
        }
    }

    /**
     * Logout from all devices
     */
    async logoutAll(accountId: number) {
        await this.refreshTokenRepository.revokeAllByAccountId(accountId);
        this.logger.log(`All sessions revoked for account ${accountId}`);
    }

    /**
     * Clean up expired tokens (should be run periodically)
     */
    async cleanupExpiredTokens() {
        const result = await this.refreshTokenRepository.deleteExpired();
        this.logger.log(`Cleaned up ${result.count} expired tokens`);
        return result;
    }
}
