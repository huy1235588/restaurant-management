import { Table } from '@/types';

/**
 * Export tables as CSV file
 */
export function exportTablesToCsv(tables: Table[], filename = 'tables.csv') {
    const headers = ['Table Number', 'Name', 'Capacity', 'Min Capacity', 'Floor', 'Section', 'Status', 'Active'];
    
    const rows = tables.map(table => [
        table.tableNumber,
        table.tableName || '',
        table.capacity,
        table.minCapacity || '',
        table.floor || '',
        table.section || '',
        table.status,
        table.isActive ? 'Yes' : 'No',
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Export tables as JSON file
 */
export function exportTablesToJson(tables: Table[], filename = 'tables.json') {
    const jsonContent = JSON.stringify(tables, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
