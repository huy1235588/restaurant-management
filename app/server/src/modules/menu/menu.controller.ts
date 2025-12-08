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
import { MenuService } from '@/modules/menu/menu.service';
import {
    CreateMenuItemDto,
    UpdateMenuItemDto,
    UpdateAvailabilityDto,
} from '@/modules/menu/dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('menu')
@Controller('menu')
export class MenuController {
    constructor(private readonly menuService: MenuService) {}

    @Public()
    @Get('count')
    @ApiOperation({ summary: 'Count menu items (public)' })
    @ApiQuery({ name: 'categoryId', required: false, type: Number })
    @ApiQuery({ name: 'isAvailable', required: false, type: Boolean })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'Menu items count retrieved' })
    async count(
        @Query('categoryId') categoryId?: string,
        @Query('isAvailable') isAvailable?: string,
        @Query('isActive') isActive?: string,
    ) {
        const count = await this.menuService.countMenuItems({
            categoryId: categoryId ? parseInt(categoryId) : undefined,
            isAvailable:
                isAvailable === 'true'
                    ? true
                    : isAvailable === 'false'
                      ? false
                      : undefined,
            isActive:
                isActive === 'true'
                    ? true
                    : isActive === 'false'
                      ? false
                      : undefined,
        });
        return {
            message: 'Menu items count retrieved successfully',
            data: { count },
        };
    }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Get all menu items with pagination (public)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'categoryId', required: false, type: Number })
    @ApiQuery({ name: 'isAvailable', required: false, type: Boolean })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'sortBy', required: false, type: String })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
    @ApiResponse({
        status: 200,
        description: 'Menu items retrieved successfully',
    })
    async getAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('categoryId') categoryId?: string,
        @Query('isAvailable') isAvailable?: string,
        @Query('isActive') isActive?: string,
        @Query('search') search?: string,
        @Query('sortBy') sortBy?: string,
        @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    ) {
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 20;

        const result = await this.menuService.getAllMenuItems({
            filters: {
                categoryId: categoryId ? parseInt(categoryId) : undefined,
                isAvailable:
                    isAvailable === 'true'
                        ? true
                        : isAvailable === 'false'
                          ? false
                          : undefined,
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
            sortBy: sortBy || 'displayOrder',
            sortOrder: sortOrder || 'asc',
        });

        return {
            message: 'Menu items retrieved successfully',
            data: result,
        };
    }

    @Public()
    @Get('category/:categoryId')
    @ApiOperation({ summary: 'Get menu items by category (public)' })
    @ApiResponse({
        status: 200,
        description: 'Menu items retrieved successfully',
    })
    async getByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
        const items = await this.menuService.getMenuItemsByCategory(categoryId);
        return {
            message: 'Menu items retrieved successfully',
            data: items,
        };
    }

    @Public()
    @Get('code/:code')
    @ApiOperation({ summary: 'Get menu item by code (public)' })
    @ApiResponse({
        status: 200,
        description: 'Menu item retrieved successfully',
    })
    @ApiResponse({ status: 404, description: 'Menu item not found' })
    async getByCode(@Param('code') code: string) {
        const menuItem = await this.menuService.getMenuItemByCode(code);
        return {
            message: 'Menu item retrieved successfully',
            data: menuItem,
        };
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Get menu item by ID (public)' })
    @ApiResponse({
        status: 200,
        description: 'Menu item retrieved successfully',
    })
    @ApiResponse({ status: 404, description: 'Menu item not found' })
    async getById(@Param('id', ParseIntPipe) id: number) {
        const menuItem = await this.menuService.getMenuItemById(id);
        return {
            message: 'Menu item retrieved successfully',
            data: menuItem,
        };
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new menu item (admin/manager only)' })
    @ApiResponse({ status: 201, description: 'Menu item created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin/Manager only' })
    async create(@Body() createMenuItemDto: CreateMenuItemDto) {
        const menuItem =
            await this.menuService.createMenuItem(createMenuItemDto);
        return {
            message: 'Menu item created successfully',
            data: menuItem,
        };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a menu item (admin/manager only)' })
    @ApiResponse({ status: 200, description: 'Menu item updated successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin/Manager only' })
    @ApiResponse({ status: 404, description: 'Menu item not found' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateMenuItemDto: UpdateMenuItemDto,
    ) {
        const menuItem = await this.menuService.updateMenuItem(
            id,
            updateMenuItemDto,
        );
        return {
            message: 'Menu item updated successfully',
            data: menuItem,
        };
    }

    @Patch(':id/availability')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update menu item availability (admin/manager only)',
    })
    @ApiResponse({
        status: 200,
        description: 'Menu item availability updated successfully',
    })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin/Manager only' })
    async updateAvailability(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateAvailabilityDto: UpdateAvailabilityDto,
    ) {
        const menuItem = await this.menuService.updateMenuItemAvailability(
            id,
            updateAvailabilityDto.isAvailable,
        );
        return {
            message: 'Menu item availability updated successfully',
            data: menuItem,
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a menu item (admin/manager only)' })
    @ApiResponse({ status: 200, description: 'Menu item deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin/Manager only' })
    @ApiResponse({ status: 404, description: 'Menu item not found' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.menuService.deleteMenuItem(id);
        return {
            message: 'Menu item deleted successfully',
        };
    }
}
