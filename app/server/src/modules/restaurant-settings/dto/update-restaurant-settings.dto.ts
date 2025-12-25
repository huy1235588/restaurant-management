import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsEmail,
    IsUrl,
    IsArray,
    ValidateNested,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OperatingHoursDto {
    @ApiProperty({ example: 'Monday - Friday' })
    @IsString()
    @MaxLength(100)
    day: string;

    @ApiProperty({ example: '10:00 - 22:00' })
    @IsString()
    @MaxLength(50)
    hours: string;
}

export class SocialLinkDto {
    @ApiProperty({ example: 'Facebook' })
    @IsString()
    @MaxLength(50)
    platform: string;

    @ApiProperty({ example: 'https://facebook.com/restaurant' })
    @IsString()
    @IsUrl()
    url: string;

    @ApiProperty({ example: 'facebook' })
    @IsString()
    @MaxLength(50)
    icon: string;
}

export class HighlightDto {
    @ApiProperty({ example: '🏆' })
    @IsString()
    @MaxLength(10)
    icon: string;

    @ApiProperty({ example: 'Years of Experience' })
    @IsString()
    @MaxLength(100)
    label: string;

    @ApiProperty({ example: '15+' })
    @IsString()
    @MaxLength(50)
    value: string;
}

export class BankConfigDto {
    @ApiProperty({ example: '970422', description: 'VietQR Bank ID' })
    @IsString()
    @MaxLength(20)
    bankId: string;

    @ApiProperty({ example: 'MB Bank', description: 'Bank name' })
    @IsString()
    @MaxLength(100)
    bankName: string;

    @ApiProperty({ example: '0123456789', description: 'Bank account number' })
    @IsString()
    @MaxLength(30)
    accountNo: string;

    @ApiProperty({
        example: 'NGUYEN VAN A',
        description: 'Account holder name',
    })
    @IsString()
    @MaxLength(100)
    accountName: string;

    @ApiPropertyOptional({
        example: 'compact2',
        description: 'VietQR template',
    })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    template?: string;
}

export class UpdateRestaurantSettingsDto {
    @ApiProperty({ example: 'Nhà Hàng Việt Nam', maxLength: 200 })
    @IsString()
    @MaxLength(200)
    name: string;

    @ApiPropertyOptional({ example: 'Hương vị truyền thống', maxLength: 500 })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    tagline?: string;

    @ApiPropertyOptional({ example: 'Trải nghiệm ẩm thực Việt Nam đích thực' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        example: 'Chào mừng đến với Nhà Hàng',
        maxLength: 200,
    })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    aboutTitle?: string;

    @ApiPropertyOptional({ example: 'Nội dung giới thiệu về nhà hàng...' })
    @IsOptional()
    @IsString()
    aboutContent?: string;

    @ApiPropertyOptional({
        example: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
        maxLength: 500,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    address?: string;

    @ApiPropertyOptional({ example: '028-1234-5678', maxLength: 20 })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;

    @ApiPropertyOptional({ example: 'info@restaurant.com', maxLength: 255 })
    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    email?: string;

    @ApiPropertyOptional({ example: 'https://maps.google.com/embed?...' })
    @IsOptional()
    @IsString()
    mapEmbedUrl?: string;

    @ApiPropertyOptional({ example: 'settings/hero.jpg', maxLength: 500 })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    heroImage?: string;

    @ApiPropertyOptional({ example: 'settings/about.jpg', maxLength: 500 })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    aboutImage?: string;

    @ApiPropertyOptional({ example: 'settings/logo.png', maxLength: 500 })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    logoUrl?: string;

    // Old image paths for deletion when images are replaced
    @ApiPropertyOptional({ 
        example: 'settings/old-logo.png', 
        maxLength: 500,
        description: 'Old logo path to delete (used when replacing image)' 
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    oldLogoUrl?: string;

    @ApiPropertyOptional({ 
        example: 'settings/old-hero.jpg', 
        maxLength: 500,
        description: 'Old hero image path to delete (used when replacing image)' 
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    oldHeroImage?: string;

    @ApiPropertyOptional({ 
        example: 'settings/old-about.jpg', 
        maxLength: 500,
        description: 'Old about image path to delete (used when replacing image)' 
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    oldAboutImage?: string;

    @ApiPropertyOptional({ type: [OperatingHoursDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OperatingHoursDto)
    operatingHours?: OperatingHoursDto[];

    @ApiPropertyOptional({ type: [SocialLinkDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SocialLinkDto)
    socialLinks?: SocialLinkDto[];

    @ApiPropertyOptional({ type: [HighlightDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HighlightDto)
    highlights?: HighlightDto[];

    @ApiPropertyOptional({
        type: BankConfigDto,
        description: 'Bank configuration for QR payment',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => BankConfigDto)
    bankConfig?: BankConfigDto;
}
