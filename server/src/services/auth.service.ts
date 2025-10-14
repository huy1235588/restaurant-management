import accountRepository from '@/repositories/account.repository';
import staffRepository from '@/repositories/staff.repository';
import { UnauthorizedError, ConflictError, NotFoundError } from '@/utils/errors';
import AuthUtils from '@/utils/auth';
import { LoginDTO, RegisterDTO, CreateStaffDTO } from '@/validators';
import { Prisma } from '@prisma/client';

export class AuthService {
    /**
     * User login
     */
    async login(data: LoginDTO) {
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
        const tokenPayload = {
            accountId: account.accountId,
            staffId: staff.staffId,
            username: account.username,
            role: staff.role,
        };

        const { accessToken, refreshToken } = AuthUtils.generateAuthTokens(tokenPayload);

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
            const decoded = AuthUtils.verifyToken(refreshToken);

            // Verify account still exists and is active
            const account = await accountRepository.findById(decoded.accountId);
            if (!account || !account.isActive) {
                throw new UnauthorizedError('Invalid refresh token');
            }

            // Generate new access token
            const tokenPayload = {
                accountId: decoded.accountId,
                staffId: decoded.staffId,
                username: decoded.username,
                role: decoded.role,
            };

            const accessToken = AuthUtils.generateToken(tokenPayload);

            return { accessToken };
        } catch (error) {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }
    }
}

export default new AuthService();
