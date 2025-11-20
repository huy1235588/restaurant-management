import { prisma } from '@/config/database';
import customerRepository from '@/features/customer/customer.repository';
import { BaseFindOptions } from '@/shared/base';
import { BadRequestError, ConflictError, NotFoundError } from '@/shared/utils/errors';
import { Customer, Prisma } from '@prisma/client';

const normalizeJsonInput = (value?: Prisma.InputJsonValue | null) => {
    if (value === null) {
        return Prisma.JsonNull;
    }
    return value ?? undefined;
};

export interface CustomerSearchFilters {
    search?: string;
    isVip?: boolean;
    phoneNumber?: string;
    email?: string;
}

export interface CreateCustomerInput {
    name: string;
    phoneNumber: string;
    email?: string;
    birthday?: Date;
    preferences?: Prisma.InputJsonValue | null;
    notes?: string;
    isVip?: boolean;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {}

export interface FindOrCreateCustomerInput {
    customerId?: number;
    name: string;
    phoneNumber: string;
    email?: string;
    isVip?: boolean;
    notes?: string;
    preferences?: Prisma.InputJsonValue | null;
}

export class CustomerService {
    /**
     * Get paginated list of customers with filtering
     * @param options - Pagination and filter options
     * @returns Paginated customer list
     */
    async listCustomers(options?: BaseFindOptions<CustomerSearchFilters>) {
        return customerRepository.findAllPaginated(options);
    }

    /**
     * Get a single customer by ID with related reservations
     * @param customerId - Unique customer ID
     * @throws NotFoundError if customer doesn't exist
     */
    async getCustomerById(customerId: number) {
        const customer = await customerRepository.findById(customerId);
        if (!customer) {
            throw new NotFoundError('Customer not found');
        }
        return customer;
    }

    /**
     * Ensure phone number or email is unique before creating/updating
     * @private
     * @throws ConflictError if contact info is already in use
     */
    private async ensureUniqueContact(phoneNumber?: string, email?: string, ignoreCustomerId?: number) {
        if (!phoneNumber && !email) {
            return;
        }
        const existing = await customerRepository.findByPhoneOrEmail(phoneNumber, email);
        if (!existing) {
            return;
        }
        if (ignoreCustomerId && existing.customerId === ignoreCustomerId) {
            return;
        }
        throw new ConflictError('Customer with the provided phone or email already exists');
    }

    /**
     * Create a new customer
     * @param data - Customer creation data
     * @returns Created customer
     * @throws ConflictError if phone or email already exists
     */
    async createCustomer(data: CreateCustomerInput): Promise<Customer> {
        await this.ensureUniqueContact(data.phoneNumber, data.email);
        return customerRepository.create({
            ...data,
            preferences: normalizeJsonInput(data.preferences),
            isVip: data.isVip ?? false,
        });
    }

    /**
     * Update customer information
     * @param customerId - Customer ID to update
     * @param data - Updated customer data
     * @returns Updated customer
     * @throws NotFoundError if customer doesn't exist
     * @throws ConflictError if new phone/email already in use
     */
    async updateCustomer(customerId: number, data: UpdateCustomerInput): Promise<Customer> {
        await this.ensureUniqueContact(data.phoneNumber, data.email, customerId);
        await this.getCustomerById(customerId);
        return customerRepository.update(customerId, {
            ...data,
            preferences: normalizeJsonInput(data.preferences),
        });
    }

    /**
     * Soft delete a customer (not implemented - use with caution)
     * @param customerId - Customer ID to delete
     * @throws NotFoundError if customer doesn't exist
     */
    async deleteCustomer(customerId: number): Promise<Customer> {
        await this.getCustomerById(customerId);
        return customerRepository.delete(customerId);
    }

    /**
     * Search customers by name, phone, or email
     * @param term - Search term
     * @param limit - Maximum number of results (default: 10)
     * @returns Array of matching customers
     */
    async searchCustomers(term: string, limit = 10) {
        return customerRepository.search(term, limit);
    }

    /**
     * Get customer's reservation history
     * @param customerId - Customer ID
     * @param limit - Maximum number of reservations to return (default: 50)
     * @returns Array of reservations ordered by date descending
     * @throws NotFoundError if customer doesn't exist
     */
    async getReservationHistory(customerId: number, limit = 50) {
        await this.getCustomerById(customerId);
        return customerRepository.getReservationHistory(customerId, limit);
    }

    /**
     * Find existing customer or create new one
     * Used during reservation creation to avoid duplicates
     * @param payload - Customer identification and creation data
     * @returns Existing or newly created customer
     */
    async findOrCreateCustomer(payload: FindOrCreateCustomerInput): Promise<Customer> {
        // If customer ID provided, fetch existing customer
        if (payload.customerId) {
            return this.getCustomerById(payload.customerId);
        }

        // Try to find by phone or email
        const existing = await customerRepository.findByPhoneOrEmail(payload.phoneNumber, payload.email);
        if (existing) {
            return existing;
        }

        // Create new customer if not found
        return customerRepository.create({
            name: payload.name,
            phoneNumber: payload.phoneNumber,
            email: payload.email,
            isVip: payload.isVip ?? false,
            notes: payload.notes,
            preferences: normalizeJsonInput(payload.preferences),
        });
    }

    /**
     * Merge duplicate customer records
     * Transfers all reservations from duplicate to primary customer and combines data
     * @param primaryCustomerId - Customer to keep (primary record)
     * @param duplicateCustomerId - Customer to merge and delete
     * @returns Updated primary customer with merged data
     * @throws BadRequestError if trying to merge same customer
     * @throws NotFoundError if either customer doesn't exist
     */
    async mergeCustomers(primaryCustomerId: number, duplicateCustomerId: number) {
        if (primaryCustomerId === duplicateCustomerId) {
            throw new BadRequestError('Cannot merge the same customer');
        }

        // Fetch both customers to ensure they exist
        const [primary, duplicate] = await Promise.all([
            this.getCustomerById(primaryCustomerId),
            this.getCustomerById(duplicateCustomerId),
        ]);

        // Perform merge in a transaction
        return prisma.$transaction(async (tx) => {
            // Transfer all reservations from duplicate to primary
            await tx.reservation.updateMany({
                where: { customerId: duplicate.customerId },
                data: { customerId: primary.customerId },
            });

            // Merge customer data intelligently
            const mergedNotesArray = [primary.notes, duplicate.notes].filter((value): value is string => Boolean(value));
            const mergedNotes = mergedNotesArray.length ? mergedNotesArray.join('\n--- MERGED ---\n') : undefined;
            const mergedPreferences = (primary.preferences ?? duplicate.preferences) ?? undefined;
            const mergedEmail = primary.email ?? duplicate.email ?? undefined;
            const mergedPhone = primary.phoneNumber || duplicate.phoneNumber;
            const mergedVip = primary.isVip || duplicate.isVip;

            // Update primary customer with merged data
            await tx.customer.update({
                where: { customerId: primary.customerId },
                data: {
                    email: mergedEmail,
                    phoneNumber: mergedPhone,
                    notes: mergedNotes,
                    preferences: normalizeJsonInput(mergedPreferences),
                    isVip: mergedVip,
                },
            });

            // Delete duplicate customer
            await tx.customer.delete({ where: { customerId: duplicate.customerId } });

            return this.getCustomerById(primary.customerId);
        });
    }
}

export const customerService = new CustomerService();
