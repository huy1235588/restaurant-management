import {
    Controller,
    Get,
    Param,
    Query,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { ReservationAuditService } from './reservation-audit.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('reservation-audits')
@Controller('reservation-audits')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReservationAuditController {
    constructor(
        private readonly reservationAuditService: ReservationAuditService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Get all reservation audit logs' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'userId', required: false, type: Number })
    @ApiResponse({
        status: 200,
        description: 'Audit logs retrieved successfully',
    })
    async findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('userId') userId?: number,
    ) {
        const pageNum = page || 1;
        const limitNum = limit || 10;
        const skip = (pageNum - 1) * limitNum;

        const { data, total } = await this.reservationAuditService.findAll({
            skip,
            take: limitNum,
            userId,
        });

        return {
            success: true,
            message: 'Audit logs retrieved successfully',
            data: {
                items: data,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            },
        };
    }

    @Get('reservation/:reservationId')
    @ApiOperation({ summary: 'Get audit logs for a specific reservation' })
    @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
    @ApiResponse({
        status: 200,
        description: 'Audit logs retrieved successfully',
    })
    async findByReservationId(
        @Param('reservationId', ParseIntPipe) reservationId: number,
    ) {
        const audits =
            await this.reservationAuditService.findByReservationId(
                reservationId,
            );
        return {
            success: true,
            message: 'Audit logs retrieved successfully',
            data: audits,
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get audit log by ID' })
    @ApiParam({ name: 'id', description: 'Audit ID' })
    @ApiResponse({
        status: 200,
        description: 'Audit log retrieved successfully',
    })
    @ApiResponse({ status: 404, description: 'Audit log not found' })
    async findById(@Param('id', ParseIntPipe) id: number) {
        const audit = await this.reservationAuditService.findById(id);
        return {
            success: true,
            message: 'Audit log retrieved successfully',
            data: audit,
        };
    }
}
