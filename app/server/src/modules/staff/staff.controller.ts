import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto, UpdateStaffRoleDto } from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('staff')
@Controller('staff')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StaffController {
    constructor(private readonly staffService: StaffService) {}

    @Get()
    @ApiOperation({ summary: 'Get all staff with pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'role', required: false, enum: Role })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'sortBy', required: false, type: String })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
    @ApiResponse({ status: 200, description: 'Staff retrieved successfully' })
    async getAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('role') role?: Role,
        @Query('isActive') isActive?: string,
        @Query('search') search?: string,
        @Query('sortBy') sortBy?: string,
        @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    ) {
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 10;

        const result = await this.staffService.getAllStaff({
            filters: {
                role,
                isActive:
                    isActive === 'true'
                        ? true
                        : isActive === 'false'
                          ? false
                          : undefined,
                search,
            },
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
            sortBy: sortBy || 'fullName',
            sortOrder: sortOrder || 'asc',
        });

        return {
            message: 'Staff retrieved successfully',
            data: result,
        };
    }

    @Get('role/:role')
    @ApiOperation({ summary: 'Get staff by role' })
    @ApiResponse({ status: 200, description: 'Staff retrieved successfully' })
    async getByRole(@Param('role') role: Role) {
        const staff = await this.staffService.getStaffByRole(role);
        return {
            message: 'Staff retrieved successfully',
            data: staff,
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get staff by ID' })
    @ApiResponse({ status: 200, description: 'Staff retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Staff not found' })
    async getById(@Param('id', ParseIntPipe) id: number) {
        const staff = await this.staffService.getStaffById(id);
        return {
            message: 'Staff retrieved successfully',
            data: staff,
        };
    }

    @Get(':id/performance')
    @ApiOperation({ summary: 'Get staff performance' })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    @ApiResponse({
        status: 200,
        description: 'Staff performance retrieved successfully',
    })
    async getPerformance(
        @Param('id', ParseIntPipe) id: number,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const performance = await this.staffService.getStaffPerformance(
            id,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
        );
        return {
            message: 'Staff performance retrieved successfully',
            data: performance,
        };
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new staff member' })
    @ApiResponse({ status: 201, description: 'Staff created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async create(@Body() createStaffDto: CreateStaffDto) {
        const staff = await this.staffService.createStaff(createStaffDto);
        return {
            message: 'Staff created successfully',
            data: staff,
        };
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a staff member' })
    @ApiResponse({ status: 200, description: 'Staff updated successfully' })
    @ApiResponse({ status: 404, description: 'Staff not found' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateStaffDto: UpdateStaffDto,
    ) {
        const staff = await this.staffService.updateStaff(id, updateStaffDto);
        return {
            message: 'Staff updated successfully',
            data: staff,
        };
    }

    @Patch(':id/deactivate')
    @ApiOperation({ summary: 'Deactivate a staff member' })
    @ApiResponse({ status: 200, description: 'Staff deactivated successfully' })
    @ApiResponse({ status: 404, description: 'Staff not found' })
    async deactivate(@Param('id', ParseIntPipe) id: number) {
        const staff = await this.staffService.deactivateStaff(id);
        return {
            message: 'Staff deactivated successfully',
            data: staff,
        };
    }

    @Patch(':id/activate')
    @ApiOperation({ summary: 'Activate a staff member' })
    @ApiResponse({ status: 200, description: 'Staff activated successfully' })
    @ApiResponse({ status: 404, description: 'Staff not found' })
    async activate(@Param('id', ParseIntPipe) id: number) {
        const staff = await this.staffService.activateStaff(id);
        return {
            message: 'Staff activated successfully',
            data: staff,
        };
    }

    @Patch(':id/role')
    @ApiOperation({ summary: 'Update staff role' })
    @ApiResponse({
        status: 200,
        description: 'Staff role updated successfully',
    })
    @ApiResponse({ status: 404, description: 'Staff not found' })
    async updateRole(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRoleDto: UpdateStaffRoleDto,
    ) {
        const staff = await this.staffService.updateStaffRole(
            id,
            updateRoleDto.role,
        );
        return {
            message: 'Staff role updated successfully',
            data: staff,
        };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a staff member' })
    @ApiResponse({ status: 200, description: 'Staff deleted successfully' })
    @ApiResponse({ status: 404, description: 'Staff not found' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.staffService.deleteStaff(id);
        return {
            message: 'Staff deleted successfully',
        };
    }
}
