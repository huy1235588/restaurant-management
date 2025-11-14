import { prisma } from '@/config/database';
import { BadRequestError } from '@/shared/utils/errors';
import { floorPlanLayoutRepository, floorPlanBackgroundRepository } from './floor-plan.repository';
import type {
    CreateFloorPlanLayoutDto,
    UpdateFloorPlanLayoutDto,
    CreateFloorPlanBackgroundDto,
    UpdateFloorPlanBackgroundDto,
    TablePositionDto,
} from './dtos';

export class FloorPlanService {
    /**
     * Get all layouts for a specific floor
     */
    async getLayoutsByFloor(restaurantId: number, floor: number) {
        return floorPlanLayoutRepository.findByFloor(restaurantId, floor);
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
    async createLayout(restaurantId: number, dto: CreateFloorPlanLayoutDto) {
        // Check if layout with same name already exists
        const existing = await floorPlanLayoutRepository.findByName(restaurantId, dto.floor, dto.name);

        if (existing) {
            throw new BadRequestError(`Layout "${dto.name}" already exists for this floor`);
        }

        return floorPlanLayoutRepository.create({
            restaurant: restaurantId,
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
     * Get background image for a floor
     */
    async getBackground(restaurantId: number, floor: number) {
        return floorPlanBackgroundRepository.findByFloor(restaurantId, floor);
    }

    /**
     * Get background by ID
     */
    async getBackgroundById(backgroundId: number) {
        return floorPlanBackgroundRepository.findById(backgroundId);
    }

    /**
     * Upload or create background image
     */
    async uploadBackground(restaurantId: number, dto: CreateFloorPlanBackgroundDto) {
        // Delete existing background for this floor
        await floorPlanBackgroundRepository.deleteByFloor(restaurantId, dto.floor);

        // Create new background
        return floorPlanBackgroundRepository.create({
            restaurant: restaurantId,
            floor: dto.floor,
            fileUrl: dto.fileUrl,
            fileName: dto.fileName,
            fileSize: dto.fileSize,
            mimeType: dto.mimeType,
        });
    }

    /**
     * Update background image properties
     */
    async updateBackground(backgroundId: number, dto: UpdateFloorPlanBackgroundDto) {
        return floorPlanBackgroundRepository.update(backgroundId, dto);
    }

    /**
     * Delete background image
     */
    async deleteBackground(backgroundId: number) {
        await floorPlanBackgroundRepository.delete(backgroundId);
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
