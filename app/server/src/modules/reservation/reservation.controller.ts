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
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { RESERVATION_MESSAGES } from './constants/reservation.constants';

@ApiTags('reservations')
@Controller('reservations')
export class ReservationController {
    constructor(private readonly reservationService: ReservationService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager', 'waiter')
    @ApiBearerAuth()
    @ApiOperation({
        summary:
            'Get all reservations with filters and pagination (admin/manager/waiter only)',
    })
    @ApiResponse({
        status: 200,
        description: 'Reservations retrieved successfully',
    })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async findAll(@Query() query: QueryReservationDto) {
        const result = await this.reservationService.findAll(query);
        return {
            success: true,
            message: RESERVATION_MESSAGES.SUCCESS.RESERVATIONS_RETRIEVED,
            data: result,
        };
    }

    @Get('check-availability')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager', 'waiter')
    @ApiBearerAuth()
    @ApiOperation({
        summary:
            'Check available tables for a specific date/time (admin/manager/waiter only)',
    })
    @ApiResponse({ status: 200, description: 'Available tables retrieved' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async checkAvailability(@Query() query: CheckAvailabilityDto) {
        const tables = await this.reservationService.checkAvailability(query);
        return {
            success: true,
            message: RESERVATION_MESSAGES.SUCCESS.AVAILABILITY_CHECKED,
            data: tables,
        };
    }

    @Get('phone/:phone')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager', 'waiter')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get reservations by phone number (admin/manager/waiter only)',
    })
    @ApiParam({ name: 'phone', description: 'Customer phone number' })
    @ApiResponse({ status: 200, description: 'Reservations retrieved' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async findByPhone(@Param('phone') phone: string) {
        const reservations = await this.reservationService.findByPhone(phone);
        return {
            success: true,
            message: RESERVATION_MESSAGES.SUCCESS.RESERVATIONS_RETRIEVED,
            data: reservations,
        };
    }

    @Get('code/:code')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager', 'waiter')
    @ApiBearerAuth()
    @ApiOperation({
        summary:
            'Get reservation by reservation code (admin/manager/waiter only)',
    })
    @ApiParam({ name: 'code', description: 'Unique reservation code' })
    @ApiResponse({ status: 200, description: 'Reservation retrieved' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Reservation not found' })
    async findByCode(@Param('code') code: string) {
        const reservation = await this.reservationService.findByCode(code);
        return {
            success: true,
            message: RESERVATION_MESSAGES.SUCCESS.RESERVATION_RETRIEVED,
            data: reservation,
        };
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager', 'waiter')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get reservation by ID (admin/manager/waiter only)',
    })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Reservation retrieved' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Reservation not found' })
    async findById(@Param('id', ParseIntPipe) id: number) {
        const reservation = await this.reservationService.findById(id);
        return {
            success: true,
            message: RESERVATION_MESSAGES.SUCCESS.RESERVATION_RETRIEVED,
            data: reservation,
        };
    }

    @Public()
    @Post()
    @ApiOperation({
        summary: 'Create a new reservation (public - for customers)',
    })
    @ApiResponse({
        status: 201,
        description: 'Reservation created successfully',
    })
    @ApiResponse({ status: 400, description: 'Bad request - validation error' })
    @ApiResponse({ status: 409, description: 'Conflict - table not available' })
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateReservationDto) {
        const reservation = await this.reservationService.create(dto);
        return {
            success: true,
            message: RESERVATION_MESSAGES.SUCCESS.RESERVATION_CREATED,
            data: reservation,
        };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager', 'waiter')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update reservation (admin/manager/waiter only)' })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Reservation updated' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
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
            message: RESERVATION_MESSAGES.SUCCESS.RESERVATION_UPDATED,
            data: reservation,
        };
    }

    @Patch(':id/confirm')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager', 'waiter')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Confirm a pending reservation (admin/manager/waiter only)',
    })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Reservation confirmed' })
    @ApiResponse({ status: 400, description: 'Invalid status transition' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async confirm(
        @Param('id', ParseIntPipe) id: number,
        @RequestDecorator() req: RequestWithUser,
    ) {
        const userId = req.user?.staffId;
        const reservation = await this.reservationService.confirm(id, userId);
        return {
            success: true,
            message: RESERVATION_MESSAGES.SUCCESS.RESERVATION_CONFIRMED,
            data: reservation,
        };
    }

    @Patch(':id/seated')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager', 'waiter')
    @ApiBearerAuth()
    @ApiOperation({
        summary:
            'Mark reservation as seated (check-in) and auto-create order (admin/manager/waiter only)',
    })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({
        status: 200,
        description:
            'Reservation marked as seated and order created successfully',
    })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async seat(
        @Param('id', ParseIntPipe) id: number,
        @RequestDecorator() req: RequestWithUser,
    ) {
        const userId = req.user?.staffId;
        const result = await this.reservationService.seat(id, userId);
        return {
            success: true,
            message: RESERVATION_MESSAGES.SUCCESS.RESERVATION_SEATED,
            data: result,
        };
    }

    @Patch(':id/complete')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager', 'waiter')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Mark reservation as completed (admin/manager/waiter only)',
    })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Reservation completed' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async complete(
        @Param('id', ParseIntPipe) id: number,
        @RequestDecorator() req: RequestWithUser,
    ) {
        const userId = req.user?.staffId;
        const reservation = await this.reservationService.complete(id, userId);
        return {
            success: true,
            message: RESERVATION_MESSAGES.SUCCESS.RESERVATION_COMPLETED,
            data: reservation,
        };
    }

    @Patch(':id/cancel')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cancel a reservation (admin/manager only)' })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Reservation cancelled' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin/Manager only' })
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
            message: RESERVATION_MESSAGES.SUCCESS.RESERVATION_CANCELLED,
            data: reservation,
        };
    }

    @Patch(':id/no-show')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Mark reservation as no-show (admin/manager only)',
    })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Reservation marked as no-show' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin/Manager only' })
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
            message: RESERVATION_MESSAGES.SUCCESS.RESERVATION_NO_SHOW,
            data: reservation,
        };
    }
}
