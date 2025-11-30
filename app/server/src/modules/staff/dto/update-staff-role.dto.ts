import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@/lib/prisma';

export class UpdateStaffRoleDto {
    @ApiProperty({
        example: 'manager',
        enum: Role,
        description: 'New staff role',
    })
    @IsEnum(Role)
    @IsNotEmpty()
    role: Role;
}
