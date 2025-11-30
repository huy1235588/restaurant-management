import {
    IsString,
    IsEmail,
    IsOptional,
    MaxLength,
    Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
    @ApiPropertyOptional({
        example: 'newemail@example.com',
        description: 'New email address',
    })
    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    email?: string;

    @ApiPropertyOptional({
        example: '0909999999',
        description: 'New phone number',
    })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    @Matches(/^[0-9+\-\s()]+$/, {
        message: 'Phone number contains invalid characters',
    })
    phoneNumber?: string;

    @ApiPropertyOptional({
        example: 'Nguyễn Văn A',
        description: 'Full name',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    fullName?: string;

    @ApiPropertyOptional({
        example: '123 Đường ABC, Quận 1, TP.HCM',
        description: 'Address',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    address?: string;
}
