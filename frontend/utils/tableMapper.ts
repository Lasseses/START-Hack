// utils/tableMapper.ts
import { Tile, TableData } from "@/types/dashboard";

/**
 * Maps table data, handling column-based object format
 * @param item The API response item
 * @param metadata Basic metadata for the tile
 * @returns A formatted Tile object for table visualization
 */
export function mapTableData(item: any, metadata: any = {}): Tile {
    let tableData: TableData[] = [];
    
    // Extract title and description from item if available
    const finalMetadata = {
        ...metadata,
        title: item.title || metadata.title || "",
        description: item.content || metadata.description || "",
        fullWidth: metadata.fullWidth !== undefined ? metadata.fullWidth : true
    };

    // Case 1: Handle standard array of objects format
    if (Array.isArray(item.data)) {
        tableData = item.data.map(row => {
            // Create a new object with the correct field mapping
            const mappedRow: any = { ...row };

            // If the row has a "name" field but no "date" field, map it
            if (mappedRow.name && !mappedRow.date) {
                mappedRow.date = mappedRow.name;
            }

            return mappedRow;
        });
    } 
    // Case 2: Handle column-based object format with indexed entries
    else if (item.data && typeof item.data === 'object' && hasIndexedObjectFormat(item.data)) {
        tableData = transformColumnWiseToRowWise(item.data);
    }
    // Case 3: Handle the case where the item itself is the data array
    else if (Array.isArray(item)) {
        tableData = item;
    }
    // Case 4: If the item is the column-wise data itself without a data property
    else if (item && typeof item === 'object' && hasIndexedObjectFormat(item)) {
        tableData = transformColumnWiseToRowWise(item);
    }

    // Determine column types for better display formatting
    const columnTypes = inferColumnTypes(tableData);
    const columnOrder = determineColumnOrder(tableData);

    return {
        type: "TABLE",
        data: tableData,
        metadata: {
            ...finalMetadata,
            columnTypes,
            columnOrder
        },
    };
}

/**
 * Checks if the data has a column-based indexed format
 * @param data The data object to check
 * @returns true if data is in column-based indexed format
 */
export function hasIndexedObjectFormat(data: any): boolean {
    // At least one column is required
    if (!data || Object.keys(data).length === 0) return false;
    
    // Check if any property is an object with numeric indices
    return Object.keys(data).some(key => {
        const column = data[key];
        return typeof column === 'object' && 
               column !== null && 
               !Array.isArray(column) &&
               Object.keys(column).some(idx => !isNaN(parseInt(idx)));
    });
}

/**
 * Transforms column-wise data to row-wise format
 * @param data The column-based data object
 * @returns An array of row objects
 */
export function transformColumnWiseToRowWise(data: any): any[] {
    if (!data || typeof data !== 'object') {
        return [];
    }
    
    const columnNames = Object.keys(data);
    const rowIndices = new Set<string>();
    
    // Collect all row indices across all columns
    columnNames.forEach(column => {
        if (data[column] && typeof data[column] === 'object') {
            Object.keys(data[column]).forEach(idx => {
                if (!isNaN(parseInt(idx))) {
                    rowIndices.add(idx);
                }
            });
        }
    });
    
    // Convert to array and sort numerically
    const sortedIndices = Array.from(rowIndices).sort((a, b) => parseInt(a) - parseInt(b));
    
    // Create an object for each row
    const rows = sortedIndices.map(rowIdx => {
        const row: any = {};
        
        // Add each column to the row
        columnNames.forEach(column => {
            if (data[column] && data[column][rowIdx] !== undefined) {
                row[column] = data[column][rowIdx];
            }
        });
        
        return row;
    });
    
    return rows;
}

/**
 * Infers column types based on column names and data
 * @param rows The array of row objects
 * @returns An object mapping column names to their inferred types
 */
function inferColumnTypes(rows: any[]): { [key: string]: string } {
    if (!rows || rows.length === 0) return {};
    
    // Collect all unique column names from all rows
    const columnSet = new Set<string>();
    rows.forEach(row => {
        Object.keys(row).forEach(key => columnSet.add(key));
    });
    
    const columns = Array.from(columnSet);
    const columnTypes: { [key: string]: string } = {};
    
    columns.forEach(column => {
        const columnLower = column.toLowerCase();
        
        // Check if column name suggests a specific type
        if (columnLower.includes('date') || 
            columnLower.includes('time') || 
            columnLower === 'day' || 
            columnLower === 'month' || 
            columnLower === 'year') {
            columnTypes[column] = 'date';
            return;
        }
        
        if (columnLower.includes('percent') || 
            columnLower.includes('%') || 
            (columnLower.includes('ratio') && !columnLower.includes('p/e ratio'))) {
            columnTypes[column] = 'percent';
            return;
        }
        
        if (columnLower.includes('price') || 
            columnLower.includes('cost') || 
            columnLower.includes('value') || 
            columnLower.includes('p/e ratio') ||
            columnLower.includes('eps')) {
            columnTypes[column] = 'currency';
            return;
        }
        
        if (columnLower.includes('volume') || 
            columnLower.includes('amount') || 
            columnLower.includes('quantity') || 
            columnLower.includes('count')) {
            columnTypes[column] = 'volume';
            return;
        }
        
        if (columnLower.includes('id') || 
            columnLower.includes('code') || 
            columnLower.includes('isin') || 
            columnLower.includes('ticker') || 
            columnLower.includes('symbol')) {
            columnTypes[column] = 'code';
            return;
        }
        
        // Sample values to determine type
        const sampleSize = Math.min(10, rows.length);
        let numericCount = 0;
        let dateCount = 0;
        let booleanCount = 0;
        
        for (let i = 0; i < sampleSize; i++) {
            if (!rows[i] || rows[i][column] === undefined || rows[i][column] === null) continue;
            
            const value = rows[i][column];
            const valueType = typeof value;
            
            if (valueType === 'boolean') {
                booleanCount++;
                continue;
            }
            
            if (valueType === 'number') {
                numericCount++;
                continue;
            }
            
            // Check string values more carefully
            if (valueType === 'string') {
                const strValue = value.trim();
                
                // Check for percentage format (e.g. "10%", "10.5%")
                if (/^-?\d+(\.\d+)?%$/.test(strValue)) {
                    columnTypes[column] = 'percent';
                    break;
                }
                
                // Check for currency format (e.g. "$10", "€10.5")
                if (/^[$€£¥][ ]?-?\d+(\.\d+)?$/.test(strValue) || 
                    /^-?\d+(\.\d+)?[ ]?[$€£¥]$/.test(strValue)) {
                    columnTypes[column] = 'currency';
                    break;
                }
                
                // Check for date format
                if (isDateString(strValue)) {
                    dateCount++;
                    continue;
                }
                
                // Check if it's a numeric string
                if (/^-?\d+(\.\d+)?$/.test(strValue)) {
                    numericCount++;
                    continue;
                }
            }
        }
        
        // Determine type based on counts
        if (booleanCount > 0 && booleanCount === sampleSize) {
            columnTypes[column] = 'boolean';
        } else if (dateCount > sampleSize * 0.5) {
            columnTypes[column] = 'date';
        } else if (numericCount > sampleSize * 0.5) {
            // Default to number if many values are numeric
            columnTypes[column] = 'number';
        } else {
            // Default to text for all other cases
            columnTypes[column] = 'text';
        }
    });
    
    return columnTypes;
}

/**
 * Helper function to check if a string looks like a date
 * @param str String to check
 * @returns true if the string appears to be a date
 */
function isDateString(str: string): boolean {
    // Common date formats
    const datePatterns = [
        /^\d{4}-\d{1,2}-\d{1,2}$/, // yyyy-mm-dd
        /^\d{1,2}-\d{1,2}-\d{4}$/, // dd-mm-yyyy or mm-dd-yyyy
        /^\d{4}\/\d{1,2}\/\d{1,2}$/, // yyyy/mm/dd
        /^\d{1,2}\/\d{1,2}\/\d{4}$/, // dd/mm/yyyy or mm/dd/yyyy
        /^\d{1,2}\.\d{1,2}\.\d{4}$/, // dd.mm.yyyy or mm.dd.yyyy
        /^\d{2}-[A-Za-z]{3}-\d{4}$/, // dd-MMM-yyyy
        /^[A-Za-z]{3} \d{1,2},? \d{4}$/ // MMM dd, yyyy
    ];
    
    return datePatterns.some(pattern => pattern.test(str)) || !isNaN(Date.parse(str));
}

/**
 * Determines the logical order for columns
 * @param rows The array of row objects
 * @returns An array of column names in preferred display order
 */
function determineColumnOrder(rows: any[]): string[] {
    if (!rows || rows.length === 0) return [];
    
    // Collect all unique column names from all rows
    const columnSet = new Set<string>();
    rows.forEach(row => {
        Object.keys(row).forEach(key => columnSet.add(key));
    });
    
    const columns = Array.from(columnSet);
    
    // Define priority categories for column ordering
    const priorityCategories = [
        // Primary identifiers
        ['name', 'title', 'label', 'description'],
        // Date and time fields
        ['date', 'time', 'day', 'month', 'year', 'period'],
        // ID and code fields
        ['id', 'code', 'isin', 'ticker', 'symbol', 'valornumber'],
        // Financial metrics
        ['price', 'value', 'cost', 'ratio', 'percent', 'return', 'eps', 'pe'],
        // Volume metrics
        ['volume', 'amount', 'quantity', 'count']
    ];
    
    // Score each column based on priority categories
    const scores: { [key: string]: number } = {};
    
    columns.forEach(column => {
        const columnLower = column.toLowerCase();
        let score = priorityCategories.length + 1; // Default score (lowest priority)
        
        priorityCategories.forEach((category, index) => {
            if (category.some(term => columnLower.includes(term))) {
                // Use category position as score (lower is higher priority)
                const categoryScore = index + 1;
                if (categoryScore < score) {
                    score = categoryScore;
                }
            }
        });
        
        scores[column] = score;
    });
    
    // Sort columns by priority score, then alphabetically
    return columns.sort((a, b) => {
        const scoreA = scores[a];
        const scoreB = scores[b];
        
        if (scoreA !== scoreB) {
            return scoreA - scoreB; // Sort by priority score (lower is better)
        }
        
        return a.localeCompare(b); // Sort alphabetically within same priority
    });
}