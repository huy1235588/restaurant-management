import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
    Request,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
    ApiParam,
} from '@nestjs/swagger';
import { ReservationService } from './reservation.service';
import {
    CreateReservationDto,
    UpdateReservationDto,
    ReservationFiltersDto,
    AvailableTablesQueryDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('reservations')
@Controller('reservations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReservationController {
    constructor(private readonly reservationService: ReservationService) {}

    @Get('available-tables')
    @ApiOperation({ summary: 'Get available tables for given criteria' })
    @ApiResponse({ status: 200, description: 'Available tables retrieved' })
    async getAvailableTables(@Query() query: AvailableTablesQueryDto) {
        return this.reservationService.getAvailableTables(query);
    }

    @Get()
    @ApiOperation({ summary: 'Get all reservations with filters' })
    @ApiResponse({ status: 200, description: 'Reservations retrieved successfully' })
    async getAllReservations(@Query() filters: ReservationFiltersDto) {
        const { page = 1, limit = 20, ...filterData } = filters;
        const skip = (page - 1) * limit;

        return this.reservationService.getAllReservations({
            filters: filterData,
            skip,
            take: limit,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get reservation by ID' })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Reservation retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Reservation not found' })
    async getReservationById(@Param('id', ParseIntPipe) id: number) {
        return this.reservationService.getReservationById(id);
    }

    @Get('code/:code')
    @ApiOperation({ summary: 'Get reservation by code' })
    @ApiParam({ name: 'code', description: 'Reservation code (UUID)' })
    @ApiResponse({ status: 200, description: 'Reservation retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Reservation not found' })
    async getReservationByCode(@Param('code') code: string) {
        return this.reservationService.getReservationByCode(code);
    }

    @Post()
    @ApiOperation({ summary: 'Create new reservation' })
    @ApiResponse({ status: 201, description: 'Reservation created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Table not found' })
    @ApiResponse({ status: 409, description: 'Table already reserved' })
    async createReservation(
        @Body() createDto: CreateReservationDto,
        @Request() req,
    ) {
        const staffId = req.user?.staffId;
        return this.reservationService.createReservation(createDto, staffId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update reservation' })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Reservation updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Reservation not found' })
    async updateReservation(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateReservationDto,
        @Request() req,
    ) {
        const staffId = req.user?.staffId;
        return this.reservationService.updateReservation(id, updateDto, staffId);
    }

    @Post(':id/confirm')
    @ApiOperation({ summary: 'Confirm reservation' })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Reservation confirmed successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Reservation not found' })
    async confirmReservation(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const staffId = req.user?.staffId;
        return this.reservationService.confirmReservation(id, staffId);
    }

    @Post(':id/seat')
    @ApiOperation({ summary: 'Seat customer' })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Customer seated successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Reservation not found' })
    async seatCustomer(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const staffId = req.user?.staffId;
        return this.reservationService.seatCustomer(id, staffId);
    }

    @Post(':id/no-show')
    @ApiOperation({ summary: 'Mark reservation as no-show' })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Marked as no-show successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Reservation not found' })
    async markNoShow(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const staffId = req.user?.staffId;
        return this.reservationService.markNoShow(id, staffId);
    }

    @Post(':id/complete')
    @ApiOperation({ summary: 'Complete reservation' })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Reservation completed successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Reservation not found' })
    async completeReservation(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const staffId = req.user?.staffId;
        return this.reservationService.completeReservation(id, staffId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Cancel reservation' })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: 200, description: 'Reservation cancelled successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Reservation not found' })
    async cancelReservation(
        @Param('id', ParseIntPipe) id: number,
        @Body('reason') reason: string,
        @Request() req,
    ) {
        const staffId = req.user?.staffId;
        return this.reservationService.cancelReservation(id, reason, staffId);
    }
}
