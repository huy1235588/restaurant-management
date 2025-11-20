/**
 * Floor Plan Data Transfer Objects
 * Defines request/response types for floor plan operations
 */

export interface TablePositionDto {
    tableId: number;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    shape?: string;
}

export interface LayoutDataDto {
    tables: TablePositionDto[];
    gridSize: number;
    zoom: number;
    [key: string]: any;
}

export interface CreateFloorPlanLayoutDto {
    floor: number;
    name: string;
    description?: string | null;
    data: LayoutDataDto;
}

export interface UpdateFloorPlanLayoutDto {
    name?: string;
    description?: string | null;
    data?: LayoutDataDto;
}
