import { prisma } from '@/config/database';
import { BadRequestError } from '@/shared/utils/errors';
import { floorPlanLayoutRepository } from './floor-plan.repository';
import type {
    CreateFloorPlanLayoutDto,
    UpdateFloorPlanLayoutDto,
    TablePositionDto,
} from './dtos';

export class FloorPlanService {
    /**
     * Get all layouts for a specific floor
     */
    async getLayoutsByFloor(floor: number) {
        return floorPlanLayoutRepository.findByFloor(floor);
    }

    /**
     * Get layout by ID
     */
    async getLayoutById(layoutId: number) {
        return floorPlanLayoutRepository.findById(layoutId);
    }

    /**
     * Create a new floor plan layout
     */
    async createLayout(dto: CreateFloorPlanLayoutDto) {
        // Check if layout with same name already exists
        const existing = await floorPlanLayoutRepository.findByName(dto.floor, dto.name);

        if (existing) {
            throw new BadRequestError(`Layout "${dto.name}" already exists for this floor`);
        }

        return floorPlanLayoutRepository.create({
            floor: dto.floor,
            name: dto.name,
            description: dto.description,
            data: dto.data,
        });
    }

    /**
     * Update a floor plan layout
     */
    async updateLayout(layoutId: number, dto: UpdateFloorPlanLayoutDto) {
        return floorPlanLayoutRepository.update(layoutId, dto);
    }

    /**
     * Delete a floor plan layout
     */
    async deleteLayout(layoutId: number) {
        await floorPlanLayoutRepository.delete(layoutId);
        return { success: true };
    }

    /**
     * Update table positions in bulk
     */
    async updateTablePositions(positions: TablePositionDto[]) {
        const updates = positions.map(pos =>
            prisma.restaurantTable.update({
                where: { tableId: pos.tableId },
                data: {
                    positionX: pos.x,
                    positionY: pos.y,
                    width: pos.width,
                    height: pos.height,
                    ...(pos.rotation !== undefined && { rotation: pos.rotation }),
                    ...(pos.shape && { shape: pos.shape }),
                },
            })
        );

        return Promise.all(updates);
    }
}

export const floorPlanService = new FloorPlanService();
