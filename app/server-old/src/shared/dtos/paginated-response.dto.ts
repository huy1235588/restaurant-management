/**
 * Generic paginated response DTO
 */
export class PaginatedResponseDto<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };

    constructor(
        items: T[],
        page: number,
        limit: number,
        total: number
    ) {
        this.items = items;
        this.pagination = {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Factory method to create from repository response
     */
    static fromRepositoryResponse<T>(response: {
        items: T[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }): PaginatedResponseDto<T> {
        return new PaginatedResponseDto(
            response.items,
            response.pagination.page,
            response.pagination.limit,
            response.pagination.total
        );
    }
}
