import { BaseRepository, BaseFilter, BaseFindOptions } from './base.repository';

/**
 * Base service class with common CRUD operations
 */
export abstract class BaseService<T, TFilter extends BaseFilter = BaseFilter> {
    protected repository: BaseRepository<T, TFilter>;

    constructor(repository: BaseRepository<T, TFilter>) {
        this.repository = repository;
    }

    /**
     * Get all items with pagination
     */
    async getAll(options?: BaseFindOptions<TFilter>) {
        return this.repository.findAllPaginated(options);
    }

    /**
     * Get items without pagination
     */
    async getAllSimple(options?: BaseFindOptions<TFilter>) {
        return this.repository.findAll(options);
    }

    /**
     * Verify item exists by ID
     */
    protected abstract verifyExists(id: string | number): Promise<T | null>;

    /**
     * Create item
     */
    protected abstract create(data: Partial<T>): Promise<T>;

    /**
     * Update item
     */
    protected abstract update(id: string | number, data: Partial<T>): Promise<T>;

    /**
     * Delete item
     */
    protected abstract delete(id: string | number): Promise<T>;
}
