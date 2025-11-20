import {
    IsString,
    IsOptional,
    IsNumber,
    IsEnum,
    IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/generated/client';

export class UpdateStaffDto {
    @ApiPropertyOptional({ example: 'John Doe', description: 'Full name' })
    @IsString()
    @IsOptional()
    fullName?: string;

    @ApiPropertyOptional({ example: '123 Main St', description: 'Address' })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional({
        example: '1990-01-01',
        description: 'Date of birth',
    })
    @IsDateString()
    @IsOptional()
    dateOfBirth?: string;

    @ApiPropertyOptional({ example: '2024-01-01', description: 'Hire date' })
    @IsDateString()
    @IsOptional()
    hireDate?: string;

    @ApiPropertyOptional({ example: 5000000, description: 'Salary' })
    @IsNumber()
    @IsOptional()
    salary?: number;

    @ApiPropertyOptional({
        example: 'WAITER',
        enum: Role,
        description: 'Staff role',
    })
    @IsEnum(Role)
    @IsOptional()
    role?: Role;
}
