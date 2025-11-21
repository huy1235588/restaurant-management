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
import { TableService } from '@/modules/table/table.service';
import {
    CreateTableDto,
    UpdateTableDto,
    UpdateTableStatusDto,
} from '@/modules/table/dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TableStatus } from '@prisma/generated/client';

@ApiTags('table')
@Controller('table')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TableController {
    constructor(private readonly tableService: TableService) {}

    @Get('stats')
    @ApiOperation({ summary: 'Get table statistics' })
    @ApiResponse({ status: 200, description: 'Table statistics retrieved' })
    async getStats() {
        const stats = await this.tableService.getTableStats();
        return {
            message: 'Table statistics retrieved successfully',
            data: stats,
        };
    }

    @Get('count')
    @ApiOperation({ summary: 'Count tables' })
    @ApiQuery({ name: 'floor', required: false, type: Number })
    @ApiQuery({ name: 'section', required: false, type: String })
    @ApiQuery({ name: 'status', required: false, enum: TableStatus })
    @ApiQuery({ name: 'capacity', required: false, type: Number })
    @ApiQuery({ name: 'minCapacity', required: false, type: Number })
    @ApiQuery({ name: 'maxCapacity', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Tables count retrieved' })
    async count(
        @Query('floor') floor?: string,
        @Query('section') section?: string,
        @Query('status') status?: TableStatus,
        @Query('capacity') capacity?: string,
        @Query('minCapacity') minCapacity?: string,
        @Query('maxCapacity') maxCapacity?: string,
    ) {
        const count = await this.tableService.countTables({
            floor: floor ? parseInt(floor) : undefined,
            section,
            status,
            capacity: capacity ? parseInt(capacity) : undefined,
            minCapacity: minCapacity ? parseInt(minCapacity) : undefined,
            maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
        });
        return {
            message: 'Tables count retrieved successfully',
            data: { count },
        };
    }

    @Get()
    @ApiOperation({ summary: 'Get all tables with pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'floor', required: false, type: Number })
    @ApiQuery({ name: 'section', required: false, type: String })
    @ApiQuery({ name: 'status', required: false, enum: TableStatus })
    @ApiQuery({ name: 'capacity', required: false, type: Number })
    @ApiQuery({ name: 'minCapacity', required: false, type: Number })
    @ApiQuery({ name: 'maxCapacity', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'sortBy', required: false, type: String })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
    @ApiResponse({ status: 200, description: 'Tables retrieved successfully' })
    async getAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('floor') floor?: string,
        @Query('section') section?: string,
        @Query('status') status?: TableStatus,
        @Query('capacity') capacity?: string,
        @Query('minCapacity') minCapacity?: string,
        @Query('maxCapacity') maxCapacity?: string,
        @Query('search') search?: string,
        @Query('sortBy') sortBy?: string,
        @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    ) {
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 10;

        const result = await this.tableService.getAllTables({
            filters: {
                floor: floor ? parseInt(floor) : undefined,
                section,
                status,
                capacity: capacity ? parseInt(capacity) : undefined,
                minCapacity: minCapacity ? parseInt(minCapacity) : undefined,
                maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
                search,
            },
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
            sortBy: sortBy || 'tableNumber',
            sortOrder: sortOrder || 'asc',
        });

        return {
            message: 'Tables retrieved successfully',
            data: result,
        };
    }

    @Get('available')
    @ApiOperation({ summary: 'Get available tables' })
    @ApiQuery({ name: 'capacity', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Available tables retrieved' })
    async getAvailable(@Query('capacity') capacity?: string) {
        const tables = await this.tableService.getAvailableTables(
            capacity ? parseInt(capacity) : undefined,
        );
        return {
            message: 'Available tables retrieved successfully',
            data: tables,
        };
    }

    @Get('floor/:floor')
    @ApiOperation({ summary: 'Get tables by floor' })
    @ApiResponse({ status: 200, description: 'Tables retrieved successfully' })
    async getByFloor(@Param('floor', ParseIntPipe) floor: number) {
        const tables = await this.tableService.getTablesByFloor(floor);
        return {
            message: 'Tables retrieved successfully',
            data: tables,
        };
    }

    @Get('section/:section')
    @ApiOperation({ summary: 'Get tables by section' })
    @ApiResponse({ status: 200, description: 'Tables retrieved successfully' })
    async getBySection(@Param('section') section: string) {
        const tables = await this.tableService.getTablesBySection(section);
        return {
            message: 'Tables retrieved successfully',
            data: tables,
        };
    }

    @Get('number/:tableNumber')
    @ApiOperation({ summary: 'Get table by table number' })
    @ApiResponse({ status: 200, description: 'Table retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Table not found' })
    async getByNumber(@Param('tableNumber') tableNumber: string) {
        const table = await this.tableService.getTableByNumber(tableNumber);
        return {
            message: 'Table retrieved successfully',
            data: table,
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get table by ID' })
    @ApiResponse({ status: 200, description: 'Table retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Table not found' })
    async getById(@Param('id', ParseIntPipe) id: number) {
        const table = await this.tableService.getTableById(id);
        return {
            message: 'Table retrieved successfully',
            data: table,
        };
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new table' })
    @ApiResponse({ status: 201, description: 'Table created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async create(@Body() createTableDto: CreateTableDto) {
        const table = await this.tableService.createTable(createTableDto);
        return {
            message: 'Table created successfully',
            data: table,
        };
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a table' })
    @ApiResponse({ status: 200, description: 'Table updated successfully' })
    @ApiResponse({ status: 404, description: 'Table not found' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTableDto: UpdateTableDto,
    ) {
        const table = await this.tableService.updateTable(id, updateTableDto);
        return {
            message: 'Table updated successfully',
            data: table,
        };
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update table status' })
    @ApiResponse({
        status: 200,
        description: 'Table status updated successfully',
    })
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateStatusDto: UpdateTableStatusDto,
    ) {
        const table = await this.tableService.updateTableStatus(
            id,
            updateStatusDto.status,
        );
        return {
            message: 'Table status updated successfully',
            data: table,
        };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a table' })
    @ApiResponse({ status: 200, description: 'Table deleted successfully' })
    @ApiResponse({ status: 404, description: 'Table not found' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.tableService.deleteTable(id);
        return {
            message: 'Table deleted successfully',
        };
    }
}
