import * as bcrypt from 'bcrypt';

// Note: JWT will be handled by NestJS JwtService in auth module
export class AuthUtils {
    static async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    static async comparePassword(
        password: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }
}

export function generatePaginationMeta(
    totalItems: number,
    page: number,
    limit: number,
) {
    const totalPages = Math.ceil(totalItems / limit);

    return {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
    };
}
