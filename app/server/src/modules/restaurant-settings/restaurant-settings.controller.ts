import {
    Controller,
    Get,
    Put,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { RestaurantSettingsService } from './restaurant-settings.service';
import { UpdateRestaurantSettingsDto } from './dto';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';

@ApiTags('restaurant-settings')
@Controller('restaurant-settings')
export class RestaurantSettingsController {
    constructor(private readonly settingsService: RestaurantSettingsService) {}

    @Get()
    @Public()
    @ApiOperation({ summary: 'Get restaurant settings (public)' })
    @ApiResponse({
        status: 200,
        description: 'Restaurant settings retrieved successfully',
    })
    async getSettings() {
        const settings = await this.settingsService.getSettings();
        return {
            message: 'Restaurant settings retrieved successfully',
            data: settings,
        };
    }

    @Put()
    @UseGuards(RolesGuard)
    @Roles('admin', 'manager')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update restaurant settings (admin/manager only)',
    })
    @ApiResponse({
        status: 200,
        description: 'Restaurant settings updated successfully',
    })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin/Manager only' })
    async updateSettings(@Body() dto: UpdateRestaurantSettingsDto) {
        const settings = await this.settingsService.updateSettings(dto);
        return {
            message: 'Restaurant settings updated successfully',
            data: settings,
        };
    }
}
