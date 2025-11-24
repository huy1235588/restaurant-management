import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsEnum,
    IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@/lib/prisma';

export class CreateStaffDto {
    @ApiProperty({ example: 1, description: 'Account ID' })
    @IsNumber()
    @IsNotEmpty()
    accountId: number;

    @ApiProperty({ example: 'John Doe', description: 'Full name' })
    @IsString()
    @IsNotEmpty()
    fullName: string;

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

    @ApiProperty({ example: 'WAITER', enum: Role, description: 'Staff role' })
    @IsEnum(Role)
    @IsNotEmpty()
    role: Role;
}
