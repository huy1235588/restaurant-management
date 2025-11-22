import { IsEnum, IsNumber, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/generated/client';

export class ProcessPaymentDto {
    @ApiProperty({
        enum: PaymentMethod,
        example: 'cash',
        description: 'Payment method',
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
        description: 'Transaction ID (for card/bank transfer)',
    })
    @IsString()
    @IsOptional()
    transactionId?: string;

    @ApiPropertyOptional({
        example: '1234',
        description: 'Last 4 digits of card number',
    })
    @IsString()
    @IsOptional()
    cardNumber?: string;

    @ApiPropertyOptional({
        example: 'John Doe',
        description: 'Card holder name',
    })
    @IsString()
    @IsOptional()
    cardHolderName?: string;

    @ApiPropertyOptional({
        example: 'Payment via bank transfer',
        description: 'Payment notes',
    })
    @IsString()
    @IsOptional()
    notes?: string;
}
