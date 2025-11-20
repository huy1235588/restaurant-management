import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UpdateStaffRoleDto {
    @ApiProperty({
        example: 'MANAGER',
        enum: Role,
        description: 'New staff role',
    })
    @IsEnum(Role)
    @IsNotEmpty()
    role: Role;
}
