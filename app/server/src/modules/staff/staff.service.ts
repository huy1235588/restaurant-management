import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { Role } from '@/lib/prisma';
import { StaffRepository, FindOptions } from './staff.repository';
import { CreateStaffDto, UpdateStaffDto } from './dto';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class StaffService {
    private readonly logger = new Logger(StaffService.name);

    constructor(
        private readonly staffRepository: StaffRepository,
        private readonly prisma: PrismaService,
    ) {}

    /**
     * Get all staff with pagination and filters
     */
    async getAllStaff(options?: FindOptions) {
        const staff = await this.staffRepository.findAll(options);
        const total = await this.staffRepository.count(options?.filters);

        return {
            items: staff,
            total,
            page: options?.skip
                ? Math.floor(options.skip / (options.take || 10)) + 1
                : 1,
            limit: options?.take || 10,
        };
    }

    /**
     * Get staff by ID
     */
    async getStaffById(staffId: number) {
        const staff = await this.staffRepository.findById(staffId);

        if (!staff) {
            throw new NotFoundException('Staff not found');
        }

        return staff;
    }

    /**
     * Create new staff
     */
    async createStaff(data: CreateStaffDto) {
        // Check if account exists
        const account = await this.prisma.account.findUnique({
            where: { accountId: data.accountId },
        });

        if (!account) {
            throw new NotFoundException('Account not found');
        }

        // Check if account already has staff profile
        const existingStaff = await this.staffRepository.findByAccountId(
            data.accountId,
        );

        if (existingStaff) {
            throw new BadRequestException(
                'Account already has a staff profile',
            );
        }

        const staff = await this.staffRepository.create({
            account: {
                connect: { accountId: data.accountId },
            },
            fullName: data.fullName,
            address: data.address,
            dateOfBirth: data.dateOfBirth
                ? new Date(data.dateOfBirth)
                : undefined,
            hireDate: data.hireDate ? new Date(data.hireDate) : new Date(),
            salary: data.salary,
            role: data.role,
        });

        this.logger.log(`Staff created: ${staff.staffId}`);
        return staff;
    }

    /**
     * Update staff
     */
    async updateStaff(staffId: number, data: UpdateStaffDto) {
        await this.getStaffById(staffId);

        const updateData: UpdateStaffDto = {
            fullName: data.fullName,
            address: data.address,
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth : undefined,
            hireDate: data.hireDate ? data.hireDate : undefined,
            salary: data.salary,
            role: data.role,
        };

        // Remove undefined values
        Object.keys(updateData).forEach(
            (key) => updateData[key] === undefined && delete updateData[key],
        );

        const staff = await this.staffRepository.update(staffId, updateData);

        this.logger.log(`Staff updated: ${staffId}`);
        return staff;
    }

    /**
     * Delete staff
     */
    async deleteStaff(staffId: number) {
        await this.getStaffById(staffId);

        await this.staffRepository.delete(staffId);

        this.logger.log(`Staff deleted: ${staffId}`);
    }

    /**
     * Deactivate staff
     */
    async deactivateStaff(staffId: number) {
        await this.getStaffById(staffId);

        const staff = await this.staffRepository.update(staffId, {
            isActive: false,
        });

        this.logger.log(`Staff deactivated: ${staffId}`);
        return staff;
    }

    /**
     * Activate staff
     */
    async activateStaff(staffId: number) {
        await this.getStaffById(staffId);

        const staff = await this.staffRepository.update(staffId, {
            isActive: true,
        });

        this.logger.log(`Staff activated: ${staffId}`);
        return staff;
    }

    /**
     * Update staff role
     */
    async updateStaffRole(staffId: number, role: Role) {
        await this.getStaffById(staffId);

        const staff = await this.staffRepository.update(staffId, { role });

        this.logger.log(`Staff role updated: ${staffId} to ${role}`);
        return staff;
    }

    /**
     * Get staff by role
     */
    async getStaffByRole(role: Role) {
        return this.staffRepository.findAll({
            filters: { role, isActive: true },
        });
    }

    /**
     * Get staff performance
     */
    async getStaffPerformance(
        staffId: number,
        startDate?: Date,
        endDate?: Date,
    ) {
        const staff = await this.getStaffById(staffId);

        // Note: This is a simplified version. For real performance metrics,
        // you would need to query orders, bills, and kitchen orders separately
        // with the date filters applied

        return {
            staff: {
                staffId: staff.staffId,
                fullName: staff.fullName,
                role: staff.role,
            },
            period: {
                startDate,
                endDate,
            },
            metrics: {
                totalOrders: 0,
                totalBills: 0,
                totalKitchenOrders: 0,
                totalRevenue: 0,
                averageOrderValue: 0,
            },
        };
    }

    /**
     * Get available accounts (accounts without staff profile)
     */
    async getAvailableAccounts() {
        return this.prisma.account.findMany({
            where: {
                staff: {
                    is: null,
                },
            },
            select: {
                accountId: true,
                username: true,
                email: true,
                phoneNumber: true,
            },
        });
    }
}
