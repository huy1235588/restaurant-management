import { Role } from '@prisma/client';
import staffRepository from '@/features/staff/staff.repository';
import accountRepository from '@/features/auth/account.repository';
import { NotFoundError, BadRequestError } from '@/shared/utils/errors';

interface StaffFilters {
    role?: Role;
    isActive?: boolean;
}

interface CreateStaffData {
    accountId: number;
    fullName: string;
    address?: string;
    dateOfBirth?: Date;
    hireDate?: Date;
    salary?: number;
    role: Role;
    isActive?: boolean;
}

interface UpdateStaffData {
    fullName?: string;
    address?: string;
    dateOfBirth?: Date;
    hireDate?: Date;
    salary?: number;
    role?: Role;
    isActive?: boolean;
}

export class StaffService {
    /**
     * Get all staff
     */
    async getAllStaff(filters: StaffFilters = {}) {
        return staffRepository.findAll(filters);
    }

    /**
     * Get staff by ID
     */
    async getStaffById(staffId: number) {
        const staff = await staffRepository.findById(staffId);

        if (!staff) {
            throw new NotFoundError('Staff not found');
        }

        return staff;
    }

    /**
     * Create new staff
     */
    async createStaff(data: CreateStaffData) {
        // Check if account exists
        const account = await accountRepository.findById(data.accountId);

        if (!account) {
            throw new NotFoundError('Account not found');
        }

        // Check if account already has staff profile
        const existingStaff = await staffRepository.findByAccountId(data.accountId);

        if (existingStaff) {
            throw new BadRequestError('Account already has a staff profile');
        }

        return staffRepository.create(data as any);
    }

    /**
     * Update staff
     */
    async updateStaff(staffId: number, data: UpdateStaffData) {
        await this.getStaffById(staffId);

        return staffRepository.update(staffId, data as any);
    }

    /**
     * Delete staff
     */
    async deleteStaff(staffId: number) {
        await this.getStaffById(staffId);

        return staffRepository.delete(staffId);
    }

    /**
     * Deactivate staff
     */
    async deactivateStaff(staffId: number) {
        await this.getStaffById(staffId);

        return staffRepository.update(staffId, { isActive: false } as any);
    }

    /**
     * Activate staff
     */
    async activateStaff(staffId: number) {
        await this.getStaffById(staffId);

        return staffRepository.update(staffId, { isActive: true } as any);
    }

    /**
     * Update staff role
     */
    async updateStaffRole(staffId: number, role: Role) {
        await this.getStaffById(staffId);

        return staffRepository.update(staffId, { role } as any);
    }

    /**
     * Get staff by role
     */
    async getStaffByRole(role: Role) {
        return staffRepository.findAll({ role, isActive: true });
    }

    /**
     * Get staff performance
     */
    async getStaffPerformance(
        staffId: number,
        startDate?: Date,
        endDate?: Date
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
}

export const staffService = new StaffService();
