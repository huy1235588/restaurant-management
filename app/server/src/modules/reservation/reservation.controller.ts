import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Body,
    Param,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
    Request as RequestDecorator,
} from '@nestjs/common';
import type { Request } from 'express';

interface RequestWithUser extends Request {
    user?: {
        staffId: number;
    };
}
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { ReservationService } from './reservation.service';
import {
    CreateReservationDto,
    UpdateReservationDto,
    QueryReservationDto,
    CancelReservationDto,
    CheckAvailabilityDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('reservations')
@Controller('reservations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReservationController {
    constructor(private readonly reservationService: ReservationService) {}

    @Get()
    @ApiOperation({
        summary: 'Get all reservations with filters and pagination',
    })
    @ApiResponse({
        status: 200,
        description: 'Reservations retrieved successfully',
    })
    async findAll(@Query() query: QueryReservationDto) {
        const result = await this.reservationService.findAll(query);
        return {
            success: true,
            message: 'Reservations retrieved successfully',
            data: result,
        };
    }

    @Get('check-availability')
    @ApiOperation({
        summary: 'Check available tables for a specific date/time',
    })
    @ApiResponse({ status: 200, description: 'Available tables retrieved' })
    async checkAvailability(@Query() query: CheckAvailabilityDto) {
        const tables = await this.reservationService.checkAvailability(query);
        return {
            success: true,
            message: 'Available tables retrieved successfully',
            data: tables,
        };
    }

    @Get('phone/:phone')
    @ApiOperation({ summary: 'Get reservations by phone number' })
    @ApiParam({ name: 'phone', description: 'Customer phone number' })
    @ApiResponse({ status: 200, description: 'Reservations retrieved' })
    async findByPhone(@Param('phone') phone: string) {
        const reservations = await this.reservationService.findByPhone(phone);
        return {
            success: true,
            message: 'Reservations retrieved successfully',
            data: reservations,
        };
    }

    @Get('code/:code')
    @ApiOperation({ summary: 'Get reservation by reservation code' })
    @ApiParam({ name: 'code', description: 'Unique reservation code' })
    @ApiResponse({ status: 200, description: 'Reservation retrieved' })
    @ApiResponse({ status: 404, description: 'Reservation not found' })
    async findByCode(@Param('code') code: string) {
        const reservation = await this.reservationService.findByCode(code);
        return {
            success: true,
            message: 'Reservation retrieved successfully',
            data: reservation,
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get reservation by ID' })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Reservation retrieved' })
    @ApiResponse({ status: 404, description: 'Reservation not found' })
    async findById(@Param('id', ParseIntPipe) id: number) {
        const reservation = await this.reservationService.findById(id);
        return {
            success: true,
            message: 'Reservation retrieved successfully',
            data: reservation,
        };
    }

    @Post()
    @ApiOperation({ summary: 'Create a new reservation' })
    @ApiResponse({
        status: 201,
        description: 'Reservation created successfully',
    })
    @ApiResponse({ status: 400, description: 'Bad request - validation error' })
    @ApiResponse({ status: 409, description: 'Conflict - table not available' })
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body() dto: CreateReservationDto,
        @RequestDecorator() req: RequestWithUser,
    ) {
        const userId = req.user?.staffId;
        const reservation = await this.reservationService.create(dto, userId);
        return {
            success: true,
            message: 'Reservation created successfully',
            data: reservation,
        };
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update reservation' })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Reservation updated' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Reservation not found' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateReservationDto,
        @RequestDecorator() req: RequestWithUser,
    ) {
        const userId = req.user?.staffId;
        const reservation = await this.reservationService.update(
            id,
            dto,
            userId,
        );
        return {
            success: true,
            message: 'Reservation updated successfully',
            data: reservation,
        };
    }

    @Patch(':id/confirm')
    @ApiOperation({ summary: 'Confirm a pending reservation' })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Reservation confirmed' })
    @ApiResponse({ status: 400, description: 'Invalid status transition' })
    async confirm(
        @Param('id', ParseIntPipe) id: number,
        @RequestDecorator() req: RequestWithUser,
    ) {
        const userId = req.user?.staffId;
        const reservation = await this.reservationService.confirm(id, userId);
        return {
            success: true,
            message: 'Reservation confirmed successfully',
            data: reservation,
        };
    }

    @Patch(':id/seated')
    @ApiOperation({ summary: 'Mark reservation as seated (check-in)' })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Reservation marked as seated' })
    async seat(
        @Param('id', ParseIntPipe) id: number,
        @RequestDecorator() req: RequestWithUser,
    ) {
        const userId = req.user?.staffId;
        const reservation = await this.reservationService.seat(id, userId);
        return {
            success: true,
            message: 'Reservation marked as seated',
            data: reservation,
        };
    }

    @Patch(':id/complete')
    @ApiOperation({ summary: 'Mark reservation as completed' })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Reservation completed' })
    async complete(
        @Param('id', ParseIntPipe) id: number,
        @RequestDecorator() req: RequestWithUser,
    ) {
        const userId = req.user?.staffId;
        const reservation = await this.reservationService.complete(id, userId);
        return {
            success: true,
            message: 'Reservation completed successfully',
            data: reservation,
        };
    }

    @Patch(':id/cancel')
    @ApiOperation({ summary: 'Cancel a reservation' })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Reservation cancelled' })
    async cancel(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CancelReservationDto,
        @RequestDecorator() req: RequestWithUser,
    ) {
        const userId = req.user?.staffId;
        const reservation = await this.reservationService.cancel(
            id,
            dto,
            userId,
        );
        return {
            success: true,
            message: 'Reservation cancelled successfully',
            data: reservation,
        };
    }

    @Patch(':id/no-show')
    @ApiOperation({ summary: 'Mark reservation as no-show' })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Reservation marked as no-show' })
    async markNoShow(
        @Param('id', ParseIntPipe) id: number,
        @RequestDecorator() req: RequestWithUser,
    ) {
        const userId = req.user?.staffId;
        const reservation = await this.reservationService.markNoShow(
            id,
            userId,
        );
        return {
            success: true,
            message: 'Reservation marked as no-show',
            data: reservation,
        };
    }
}
