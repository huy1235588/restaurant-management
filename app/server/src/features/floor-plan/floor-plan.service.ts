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
     * Only updates existing tables (positive IDs)
     */
    async updateTablePositions(positions: TablePositionDto[]) {
        // Filter out invalid IDs (negative or non-existent)
        const validPositions = positions.filter(pos => pos.tableId > 0);
        
        if (validPositions.length === 0) {
            return [];
        }

        // Get existing table IDs to verify they exist
        const tableIds = validPositions.map(pos => pos.tableId);
        const existingTables = await prisma.restaurantTable.findMany({
            where: { tableId: { in: tableIds } },
            select: { tableId: true },
        });
        
        const existingTableIds = new Set(existingTables.map(t => t.tableId));
        
        // Only update tables that exist in the database
        const updates = validPositions
            .filter(pos => existingTableIds.has(pos.tableId))
            .map(pos =>
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

    /**
     * Activate a layout
     */
    async activateLayout(layoutId: number) {
        const layout = await floorPlanLayoutRepository.findById(layoutId);
        
        if (!layout) {
            throw new BadRequestError('Layout not found');
        }

        return floorPlanLayoutRepository.activate(layoutId, layout.floor);
    }

    /**
     * Duplicate a layout
     */
    async duplicateLayout(layoutId: number, newName: string) {
        // Check if layout with new name already exists
        const layout = await floorPlanLayoutRepository.findById(layoutId);
        
        if (!layout) {
            throw new BadRequestError('Layout not found');
        }

        const existing = await floorPlanLayoutRepository.findByName(layout.floor, newName);

        if (existing) {
            throw new BadRequestError(`Layout "${newName}" already exists for this floor`);
        }

        return floorPlanLayoutRepository.duplicate(layoutId, newName);
    }
}

export const floorPlanService = new FloorPlanService();
