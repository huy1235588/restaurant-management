import accountRepository from '@/features/auth/account.repository';
import staffRepository from '@/features/staff/staff.repository';
import refreshTokenRepository from '@/features/auth/refreshToken.repository';
import { UnauthorizedError, ConflictError, NotFoundError } from '@/shared/utils/errors';
import AuthUtils, { TokenPayload } from '@/shared/utils/auth';
import { LoginDTO, RegisterDTO, CreateStaffDTO } from '@/features/auth/dtos';
import { Prisma } from '@prisma/client';
import config from '@/config';

export class AuthService {
    /**
     * User login
     */
    async login(data: LoginDTO, deviceInfo?: string, ipAddress?: string) {
        const { username, password } = data;

        // Find account
        const account = await accountRepository.findByUsername(username);
        if (!account) {
            throw new UnauthorizedError('Invalid username or password');
        }

        if (!account.isActive) {
            throw new UnauthorizedError('Account is inactive');
        }

        // Verify password
        const isPasswordValid = await AuthUtils.comparePassword(password, account.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid username or password');
        }

        // Get staff info
        const staff = await staffRepository.findByAccountId(account.accountId);
        if (!staff) {
            throw new NotFoundError('Staff profile not found');
        }

        // Update last login
        await accountRepository.updateLastLogin(account.accountId);

        // Generate tokens
        const tokenPayload: TokenPayload = {
            accountId: account.accountId,
            staffId: staff.staffId,
            username: account.username,
            role: staff.role,
        };

        const { accessToken, refreshToken } = AuthUtils.generateAuthTokens(tokenPayload);

        // Store refresh token in database
        await refreshTokenRepository.create({
            account: {
                connect: { accountId: account.accountId },
            },
            token: refreshToken,
            expiresAt: AuthUtils.getTokenExpirationDate(config.jwtRefreshExpiresIn),
            deviceInfo,
            ipAddress,
        });

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
        const account = await accountRepository.findById(accountId);
        if (!account) {
            throw new NotFoundError('Account not found');
        }

        const staff = await staffRepository.findByAccountId(accountId);
        if (!staff) {
            throw new NotFoundError('Staff profile not found');
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
    async register(data: RegisterDTO) {
        // Check if username exists
        const existingUsername = await accountRepository.findByUsername(data.username);
        if (existingUsername) {
            throw new ConflictError('Username already exists');
        }

        // Check if email exists
        const existingEmail = await accountRepository.findByEmail(data.email);
        if (existingEmail) {
            throw new ConflictError('Email already exists');
        }

        // Check if phone exists
        const existingPhone = await accountRepository.findByPhoneNumber(data.phoneNumber);
        if (existingPhone) {
            throw new ConflictError('Phone number already exists');
        }

        // Hash password
        const hashedPassword = await AuthUtils.hashPassword(data.password);

        // Create account
        const account = await accountRepository.create({
            username: data.username,
            email: data.email,
            phoneNumber: data.phoneNumber,
            password: hashedPassword,
        });

        return {
            accountId: account.accountId,
            username: account.username,
            email: account.email,
        };
    }

    /**
     * Create staff with account
     */
    async createStaff(data: CreateStaffDTO) {
        // Check if username exists
        const existingUsername = await accountRepository.findByUsername(data.username);
        if (existingUsername) {
            throw new ConflictError('Username already exists');
        }

        // Check if email exists
        const existingEmail = await accountRepository.findByEmail(data.email);
        if (existingEmail) {
            throw new ConflictError('Email already exists');
        }

        // Check if phone exists
        const existingPhone = await accountRepository.findByPhoneNumber(data.phoneNumber);
        if (existingPhone) {
            throw new ConflictError('Phone number already exists');
        }

        // Hash password
        const hashedPassword = await AuthUtils.hashPassword(data.password);

        // Create staff with account
        const staffData: Prisma.StaffCreateInput = {
            fullName: data.fullName,
            address: data.address,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
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

        const staff = await staffRepository.create(staffData);

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
            const decoded = AuthUtils.verifyToken(refreshToken);

            // Check if refresh token exists and is valid in database
            const storedToken = await refreshTokenRepository.findByToken(refreshToken);
            if (!storedToken) {
                throw new UnauthorizedError('Invalid refresh token');
            }

            // Verify account still exists and is active
            const account = storedToken.account;
            if (!account || !account.isActive) {
                throw new UnauthorizedError('Account is inactive or not found');
            }

            // Generate new access token
            const tokenPayload: TokenPayload = {
                accountId: decoded.accountId,
                staffId: decoded.staffId,
                username: decoded.username,
                role: decoded.role,
            };

            const accessToken = AuthUtils.generateToken(tokenPayload, config.jwtExpiresIn);

            return { accessToken };
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                throw error;
            }
            throw new UnauthorizedError('Invalid or expired refresh token');
        }
    }

    /**
     * Logout user
     */
    async logout(refreshToken?: string) {
        if (refreshToken) {
            try {
                // Revoke refresh token from database
                await refreshTokenRepository.deleteByToken(refreshToken);
            } catch (error) {
                // Ignore errors during logout
            }
        }
    }

    /**
     * Logout from all devices
     */
    async logoutAll(accountId: number) {
        await refreshTokenRepository.revokeAllByAccountId(accountId);
    }

    /**
     * Clean up expired tokens (should be run periodically)
     */
    async cleanupExpiredTokens() {
        return refreshTokenRepository.deleteExpired();
    }
}

export default new AuthService();
