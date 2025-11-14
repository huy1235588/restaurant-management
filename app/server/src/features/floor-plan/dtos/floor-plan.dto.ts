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

export interface FloorPlanLayoutResponseDto {
    layoutId: number;
    restaurant: number;
    floor: number;
    name: string;
    description?: string | null;
    data: LayoutDataDto;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateFloorPlanBackgroundDto {
    floor: number;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
}

export interface UpdateFloorPlanBackgroundDto {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    opacity?: number;
    positionX?: number;
    positionY?: number;
    scaleX?: number;
    scaleY?: number;
}

export interface FloorPlanBackgroundResponseDto {
    backgroundId: number;
    restaurant: number;
    floor: number;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    opacity: number;
    positionX: number;
    positionY: number;
    scaleX: number;
    scaleY: number;
    createdAt: Date;
    updatedAt: Date;
}
