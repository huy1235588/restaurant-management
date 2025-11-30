import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import {
    DashboardStatusDto,
    RecentActivityQueryDto,
    RecentActivityResponseDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('status')
    @Roles('admin', 'manager', 'waiter', 'chef', 'cashier')
    @ApiOperation({ summary: 'Get current operational status' })
    @ApiResponse({
        status: 200,
        description: 'Dashboard status retrieved successfully',
        type: DashboardStatusDto,
    })
    async getStatus() {
        const data = await this.dashboardService.getStatus();
        return {
            message: 'Dashboard status retrieved successfully',
            data,
        };
    }

    @Get('recent-activity')
    @Roles('admin', 'manager', 'waiter', 'cashier')
    @ApiOperation({ summary: 'Get recent activity' })
    @ApiResponse({
        status: 200,
        description: 'Recent activity retrieved successfully',
        type: RecentActivityResponseDto,
    })
    async getRecentActivity(@Query() query: RecentActivityQueryDto) {
        const data = await this.dashboardService.getRecentActivity(query);
        return {
            message: 'Recent activity retrieved successfully',
            data,
        };
    }
}
