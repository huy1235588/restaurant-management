import {
    IsEnum,
    IsNumber,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@/lib/prisma';

export class ProcessPaymentDto {
    @ApiProperty({
        enum: PaymentMethod,
        example: 'cash',
        description: 'Payment method (cash or transfer)',
    })
    @IsEnum(PaymentMethod)
    @IsNotEmpty()
    paymentMethod: PaymentMethod;

    @ApiProperty({ example: 500000, description: 'Payment amount' })
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    amount: number;

    @ApiPropertyOptional({
        example: 'TXN123456',
        description: 'Transaction ID (for bank transfer)',
    })
    @IsString()
    @IsOptional()
    transactionId?: string;

    @ApiPropertyOptional({
        example: 'Payment via bank transfer',
        description: 'Payment notes',
    })
    @IsString()
    @IsOptional()
    notes?: string;
}
