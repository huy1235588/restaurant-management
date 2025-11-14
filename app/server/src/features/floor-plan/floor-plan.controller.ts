import { Response, NextFunction } from 'express';
import { floorPlanService } from './floor-plan.service';
import { ApiResponse } from '@/shared/utils/response';
import { AuthRequest } from '@/shared/middlewares/auth';
import type {
    CreateFloorPlanLayoutDto,
    UpdateFloorPlanLayoutDto,
    TablePositionDto,
} from './dtos';

export class FloorPlanController {
    /**
     * Get all layouts for a specific floor
     */
    async getLayoutsByFloor(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { floor } = req.params;

            const layouts = await floorPlanService.getLayoutsByFloor(
                parseInt(floor!)
            );

            res.json(ApiResponse.success(layouts, 'Floor plan layouts retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get layout by ID
     */
    async getLayoutById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { layoutId } = req.params;

            const layout = await floorPlanService.getLayoutById(parseInt(layoutId!));

            res.json(ApiResponse.success(layout, 'Floor plan layout retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new floor plan layout
     */
    async createLayout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto = req.body as CreateFloorPlanLayoutDto;

            const layout = await floorPlanService.createLayout(dto);

            res.status(201).json(ApiResponse.success(layout, 'Floor plan layout created successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a floor plan layout
     */
    async updateLayout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { layoutId } = req.params;
            const dto = req.body as UpdateFloorPlanLayoutDto;

            const layout = await floorPlanService.updateLayout(parseInt(layoutId!), dto);

            res.json(ApiResponse.success(layout, 'Floor plan layout updated successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a floor plan layout
     */
    async deleteLayout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { layoutId } = req.params;

            await floorPlanService.deleteLayout(parseInt(layoutId!));

            res.json(ApiResponse.success(null, 'Floor plan layout deleted successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update table positions in bulk
     */
    async updateTablePositions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { positions } = req.body as { positions: TablePositionDto[] };

            const results = await floorPlanService.updateTablePositions(positions);

            res.json(
                ApiResponse.success(
                    { updated: results.length, tables: results },
                    'Table positions updated successfully'
                )
            );
        } catch (error) {
            next(error);
        }
    }
}

export const floorPlanController = new FloorPlanController();
