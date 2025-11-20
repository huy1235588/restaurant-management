/**
 * Base filter interface
 */
export interface BaseFilter {
    search?: string;
    isActive?: boolean;
}

/**
 * Base find options
 */
export interface BaseFindOptions<T extends BaseFilter = BaseFilter> {
    filters?: T;
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Base repository class with common pagination and search functionality
 */
export abstract class BaseRepository<T, TFilter extends BaseFilter = BaseFilter> {
    /**
     * Build where clause for Prisma query
     * Should be overridden in child classes for specific logic
     */
    protected abstract buildWhereClause(filters?: TFilter): Record<string, unknown>;

    /**
     * Build sort order for Prisma query
     */
    protected buildOrderBy(sortBy?: string, sortOrder: 'asc' | 'desc' = 'asc'): Record<string, 'asc' | 'desc'> {
        if (!sortBy) {
            return { createdAt: sortOrder };
        }
        return { [sortBy]: sortOrder };
    }

    /**
     * Common find all with pagination
     */
    abstract findAll(options?: BaseFindOptions<TFilter>): Promise<T[]>;

    /**
     * Common count
     */
    abstract count(filters?: TFilter): Promise<number>;

    /**
     * Find all with pagination metadata
     */
    async findAllPaginated(options?: BaseFindOptions<TFilter>) {
        const skip = options?.skip || 0;
        const take = options?.take || 10;
        const sortBy = options?.sortBy || 'createdAt';
        const sortOrder = options?.sortOrder || 'asc';

        const [items, total] = await Promise.all([
            this.findAll({
                filters: options?.filters,
                skip,
                take,
                sortBy,
                sortOrder,
            }),
            this.count(options?.filters),
        ]);

        const page = Math.floor(skip / take) + 1;
        const limit = take;
        const totalPages = Math.ceil(total / limit);

        return {
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }
}
