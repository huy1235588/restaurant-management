import {
    IsString,
    IsEmail,
    IsNotEmpty,
    MinLength,
    IsOptional,
    IsDateString,
    IsNumber,
    IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateStaffDto {
    @ApiProperty({ example: 'john_doe', description: 'Username' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: 'john@example.com', description: 'Email address' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'password123', description: 'Password' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: '+84123456789', description: 'Phone number' })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

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
    dateOfBirth?: Date;

    @ApiPropertyOptional({ example: '2024-01-01', description: 'Hire date' })
    @IsDateString()
    @IsOptional()
    hireDate?: Date;

    @ApiPropertyOptional({ example: 5000000, description: 'Salary' })
    @IsNumber()
    @IsOptional()
    salary?: number;

    @ApiProperty({ example: 'WAITER', enum: Role, description: 'Staff role' })
    @IsEnum(Role)
    @IsNotEmpty()
    role: Role;
}
