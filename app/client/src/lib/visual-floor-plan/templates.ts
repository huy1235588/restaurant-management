import { Table } from '@/types';

export type LayoutTemplateId = 'fine-dining' | 'casual-dining' | 'bar-lounge' | 'banquet';

export interface TemplateMetadata {
    id: LayoutTemplateId;
    name: string;
    description: string;
    recommendedFor: string;
}

export interface TemplateLayoutState {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    shape: Table['shape'];
}

const BASE_OFFSET_X = 60;
const BASE_OFFSET_Y = 60;

export const TEMPLATE_METADATA: TemplateMetadata[] = [
    {
        id: 'fine-dining',
        name: 'Fine Dining',
        description: 'Symmetrical grid with generous spacing and square tables.',
        recommendedFor: 'Formal restaurants, tasting menus',
    },
    {
        id: 'casual-dining',
        name: 'Casual Dining',
        description: 'Staggered layout with mixed shapes for a relaxed feel.',
        recommendedFor: 'Bistros, cafes, brunch spots',
    },
    {
        id: 'bar-lounge',
        name: 'Bar / Lounge',
        description: 'High-top rails along the walls with lounge pods in the center.',
        recommendedFor: 'Bars, lounges, cocktail venues',
    },
    {
        id: 'banquet',
        name: 'Banquet Hall',
        description: 'Long communal tables arranged in parallel rows.',
        recommendedFor: 'Events, weddings, conference dining',
    },
];

function buildResult(tables: Table[]): Map<number, TemplateLayoutState> {
    return new Map<number, TemplateLayoutState>(
        tables.map((table) => [
            table.tableId,
            {
                x: table.positionX ?? BASE_OFFSET_X,
                y: table.positionY ?? BASE_OFFSET_Y,
                width: table.width ?? 90,
                height: table.height ?? 90,
                rotation: table.rotation ?? 0,
                shape: table.shape ?? 'rectangle',
            },
        ])
    );
}

function applyFineDining(tables: Table[]): Map<number, TemplateLayoutState> {
    const result = buildResult(tables);
    if (tables.length === 0) return result;

    const columns = Math.max(1, Math.ceil(Math.sqrt(tables.length)));
    const spacingX = 180;
    const spacingY = 150;

    tables.forEach((table, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        result.set(table.tableId, {
            x: BASE_OFFSET_X + column * spacingX,
            y: BASE_OFFSET_Y + row * spacingY,
            width: 95,
            height: 95,
            rotation: 0,
            shape: 'square',
        });
    });

    return result;
}

function applyCasualDining(tables: Table[]): Map<number, TemplateLayoutState> {
    const result = buildResult(tables);
    if (tables.length === 0) return result;

    const columns = 3;
    const spacingX = 210;
    const spacingY = 150;
    const shapes: Table['shape'][] = ['circle', 'rectangle', 'oval', 'square'];

    tables.forEach((table, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const staggerOffset = row % 2 === 0 ? 0 : spacingX / 2;
        const shape = shapes[index % shapes.length];
        const width = shape === 'rectangle' ? 130 : 100;
        const height = shape === 'rectangle' ? 80 : 100;

        result.set(table.tableId, {
            x: BASE_OFFSET_X + column * spacingX + staggerOffset,
            y: BASE_OFFSET_Y + row * spacingY,
            width,
            height,
            rotation: 0,
            shape,
        });
    });

    return result;
}

function applyBarLounge(tables: Table[]): Map<number, TemplateLayoutState> {
    const result = buildResult(tables);
    if (tables.length === 0) return result;

    const divider = Math.ceil(tables.length / 2);
    const railSpacing = 130;
    const wallOffset = 40;
    const centerOffset = 260;

    tables.forEach((table, index) => {
        if (index < divider) {
            // Left rail
            result.set(table.tableId, {
                x: BASE_OFFSET_X + wallOffset,
                y: BASE_OFFSET_Y + index * railSpacing,
                width: 70,
                height: 130,
                rotation: 90,
                shape: 'rectangle',
            });
        } else {
            // Right rail / lounge pods
            const loungeIndex = index - divider;
            const podRow = Math.floor(loungeIndex / 2);
            const podColumn = loungeIndex % 2;
            result.set(table.tableId, {
                x: BASE_OFFSET_X + centerOffset + podColumn * 200,
                y: BASE_OFFSET_Y + podRow * 160,
                width: 110,
                height: 90,
                rotation: 0,
                shape: podColumn === 0 ? 'oval' : 'circle',
            });
        }
    });

    return result;
}

function applyBanquet(tables: Table[]): Map<number, TemplateLayoutState> {
    const result = buildResult(tables);
    if (tables.length === 0) return result;

    const rows = Math.min(3, Math.ceil(tables.length / 4));
    const tablesPerRow = Math.ceil(tables.length / rows);
    const spacingX = 260;
    const spacingY = 170;

    tables.forEach((table, index) => {
        const row = Math.floor(index / tablesPerRow);
        const column = index % tablesPerRow;
        result.set(table.tableId, {
            x: BASE_OFFSET_X + column * spacingX,
            y: BASE_OFFSET_Y + row * spacingY,
            width: 220,
            height: 70,
            rotation: 0,
            shape: 'rectangle',
        });
    });

    return result;
}

export function generateTemplateLayout(
    templateId: LayoutTemplateId,
    tables: Table[]
): Map<number, TemplateLayoutState> {
    switch (templateId) {
        case 'fine-dining':
            return applyFineDining(tables);
        case 'casual-dining':
            return applyCasualDining(tables);
        case 'bar-lounge':
            return applyBarLounge(tables);
        case 'banquet':
            return applyBanquet(tables);
        default:
            return buildResult(tables);
    }
}
