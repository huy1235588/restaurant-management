import { PaginationParams } from '../types';

export class PaginationDto {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';

    constructor(params: PaginationParams) {
        this.page = Math.max(1, params.page || 1);
        this.limit = Math.min(100, Math.max(1, params.limit || 10));
        this.sortBy = params.sortBy;
        this.sortOrder = params.sortOrder || 'desc';
    }

    get skip(): number {
        return (this.page - 1) * this.limit;
    }

    get take(): number {
        return this.limit;
    }
}
