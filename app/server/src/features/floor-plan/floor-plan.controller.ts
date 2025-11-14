import { Request, Response, NextFunction } from 'express';
import { floorPlanService } from './floor-plan.service';
import { ApiResponse } from '@/shared/utils/response';
import type {
    CreateFloorPlanLayoutDto,
    UpdateFloorPlanLayoutDto,
    CreateFloorPlanBackgroundDto,
    UpdateFloorPlanBackgroundDto,
    TablePositionDto,
} from './dtos';

export class FloorPlanController {
    /**
     * Get all layouts for a specific floor
     */
    async getLayoutsByFloor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { floor } = req.params;
            const restaurantId = (req as any).user?.restaurantId;

            if (!restaurantId) {
                res.status(401).json(
                    ApiResponse.error('Unauthorized', 'User not authenticated')
                );
                return;
            }

            const layouts = await floorPlanService.getLayoutsByFloor(
                restaurantId,
                parseInt(floor || '0')
            );

            res.json(ApiResponse.success(layouts, 'Floor plan layouts retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get layout by ID
     */
    async getLayoutById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { layoutId } = req.params;

            const layout = await floorPlanService.getLayoutById(parseInt(layoutId || '0'));

            res.json(ApiResponse.success(layout, 'Floor plan layout retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new floor plan layout
     */
    async createLayout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurantId = (req as any).user?.restaurantId;

            if (!restaurantId) {
                res.status(401).json(
                    ApiResponse.error('Unauthorized', 'User not authenticated')
                );
                return;
            }

            const dto = req.body as CreateFloorPlanLayoutDto;

            const layout = await floorPlanService.createLayout(restaurantId, dto);

            res.status(201).json(ApiResponse.success(layout, 'Floor plan layout created successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a floor plan layout
     */
    async updateLayout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { layoutId } = req.params;
            const dto = req.body as UpdateFloorPlanLayoutDto;

            const layout = await floorPlanService.updateLayout(parseInt(layoutId || '0'), dto);

            res.json(ApiResponse.success(layout, 'Floor plan layout updated successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a floor plan layout
     */
    async deleteLayout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { layoutId } = req.params;

            await floorPlanService.deleteLayout(parseInt(layoutId || '0'));

            res.json(ApiResponse.success(null, 'Floor plan layout deleted successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get background for a specific floor
     */
    async getBackground(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { floor } = req.params;
            const restaurantId = (req as any).user?.restaurantId;

            if (!restaurantId) {
                res.status(401).json(
                    ApiResponse.error('Unauthorized', 'User not authenticated')
                );
                return;
            }

            const background = await floorPlanService.getBackground(
                restaurantId,
                parseInt(floor || '0')
            );

            res.json(
                ApiResponse.success(
                    background,
                    'Floor plan background retrieved successfully'
                )
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get background by ID
     */
    async getBackgroundById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { backgroundId } = req.params;

            const background = await floorPlanService.getBackgroundById(parseInt(backgroundId || '0'));

            res.json(ApiResponse.success(background, 'Floor plan background retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Upload background image for a floor
     */
    async uploadBackground(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurantId = (req as any).user?.restaurantId;

            if (!restaurantId) {
                res.status(401).json(
                    ApiResponse.error('Unauthorized', 'User not authenticated')
                );
                return;
            }

            const dto = req.body as CreateFloorPlanBackgroundDto;

            const background = await floorPlanService.uploadBackground(restaurantId, dto);

            res.status(201).json(ApiResponse.success(background, 'Floor plan background uploaded successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update background properties
     */
    async updateBackground(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { backgroundId } = req.params;
            const dto = req.body as UpdateFloorPlanBackgroundDto;

            const background = await floorPlanService.updateBackground(parseInt(backgroundId || '0'), dto);

            res.json(ApiResponse.success(background, 'Floor plan background updated successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete background image
     */
    async deleteBackground(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { backgroundId } = req.params;

            await floorPlanService.deleteBackground(parseInt(backgroundId || '0'));

            res.json(ApiResponse.success(null, 'Floor plan background deleted successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update table positions in bulk
     */
    async updateTablePositions(req: Request, res: Response, next: NextFunction): Promise<void> {
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
