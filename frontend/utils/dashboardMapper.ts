// utils/dashboardMapper.ts
import { Tile, CandlestickData, PieData, BarData, AreaData, TableData } from "@/types/dashboard";

/**
 * Maps API response data to the dashboard tile format
 * @param apiResponse The response from the Canvas API
 * @returns An array of dashboard tiles
 */
export function mapApiResponseToTiles(apiResponse: any[]): Tile[] {
    return apiResponse.map((item) => {
        const baseMetadata = {
            title: item.title || "",
            description: item.content || "",
            fullWidth: false, // Default value, adjust as needed
        };

        switch (item.type) {
            case "CANDLE":
                return mapCandlestickData(item, baseMetadata);
            case "LINE":
            case "AREA":
                return mapAreaData(item, baseMetadata);
            case "BAR":
                return mapBarData(item, baseMetadata);
            case "PIE":
                return mapPieData(item, baseMetadata);
            case "TABLE":
                return mapTableData(item, baseMetadata);
            default:
                console.warn(`Unknown chart type: ${item.type}`);
                return {
                    type: "UNKNOWN" as any,
                    data: [],
                    metadata: baseMetadata,
                };
        }
    });
}

/**
 * Maps candlestick chart data
 */
function mapCandlestickData(item: any, metadata: any): Tile {
    const candlestickData: CandlestickData[] = (item.data || []).map((d: any) => ({
        x: d.name || new Date(d.date || "").toISOString(),
        y: [
            d.open || 0,
            d.high || 0,
            d.low || 0,
            d.close || 0,
        ],
        volume: d.volume || 0,
    }));

    return {
        type: "CANDLE",
        data: candlestickData,
        metadata,
    };
}

/**
 * Maps area/line chart data
 */
function mapAreaData(item: any, metadata: any): Tile {
    let areaSeries: AreaData[] = [];

    // Handle multiple series data
    if (Array.isArray(item.data) && item.data.length > 0 && Array.isArray(item.data[0].data)) {
        // Multi-series format
        areaSeries = item.data.map((series: any) => ({
            name: series.name || "Series",
            data: (series.data || []).map((point: any) => {
                // Handle different possible data formats
                if (typeof point === "object" && point !== null) {
                    return {
                        x: typeof point.x === "string" ? new Date(point.x).getTime() : (point.x || 0),
                        y: point.y || 0,
                    };
                } else if (Array.isArray(point)) {
                    return {
                        x: typeof point[0] === "string" ? new Date(point[0]).getTime() : (point[0] || 0),
                        y: point[1] || 0,
                    };
                }
                return { x: 0, y: 0 };
            }),
        }));
    }
    // Handle single-series time-based data (like OHLC data adapted for line/area)
    else if (Array.isArray(item.data)) {
        areaSeries = [{
            name: "Series",
            data: item.data.map((point: any) => ({
                x: typeof point.name === "string"
                    ? new Date(point.name).getTime()
                    : (typeof point.date === "string" ? new Date(point.date).getTime() : 0),
                y: point.close || point.value || 0,
            })),
        }];
    }

    return {
        type: "AREA",
        data: areaSeries,
        metadata,
    };
}

/**
 * Maps bar chart data
 */
function mapBarData(item: any, metadata: any): Tile {
    let barSeries: BarData[] = [];
    let categories: string[] = [];

    // Handle array of objects with name/value pairs
    if (Array.isArray(item.data) && item.data.length > 0 && !Array.isArray(item.data[0])) {
        categories = item.data.map((d: any) => d.name || d.category || "");
        barSeries = [{
            name: "Value",
            data: item.data.map((d: any) => d.value || 0),
        }];
    }
    // Handle multi-series data
    else if (Array.isArray(item.data) && item.data.length > 0 && Array.isArray(item.data[0].data)) {
        barSeries = item.data.map((series: any) => ({
            name: series.name || "Series",
            data: series.data || [],
        }));

        // Extract categories if available
        if (item.categories) {
            categories = item.categories;
        }
    }

    return {
        type: "BAR",
        data: barSeries,
        metadata: {
            ...metadata,
            categories,
        },
    };
}

/**
 * Maps pie chart data
 */
/**
 * Maps pie chart data, handling both standard format and the specialized object-based format
 * @param item The API response item
 * @param metadata Basic metadata for the tile
 * @returns A formatted Tile object for pie chart visualization
 */
function mapPieData(item: any, metadata: any): Tile {
    let series: number[] = [];
    let labels: string[] = [];
    let colors: string[] = [];
  
    // Handle the case where data is an array of objects with name/value pairs (standard format)
    if (Array.isArray(item.data)) {
      item.data.forEach((d: any) => {
        if (d.value !== undefined) {
          labels.push(d.name || d.label || "");
          series.push(d.value || 0);
        }
      });
    } 
    // Handle the case where data is an object with indexed properties (special format)
    else if (item.data && typeof item.data === 'object') {
      // Check if it has the NASDAQ stocks format with Name as property
      if (item.data.Name && typeof item.data.Name === 'object') {
        const nameObj = item.data.Name;
        const totalStocks = Object.keys(nameObj).length;
        
        // Limit to top 15 for better visualization
        const MAX_SLICES = 15;
        const showOthers = totalStocks > MAX_SLICES;
        const slicesToShow = Math.min(totalStocks, MAX_SLICES);
        
        // Generate mock weights based on index position 
        // (in a real app, you would use actual market cap or index weights)
        let totalWeight = 0;
        const weights: {[key: string]: number} = {};
        
        // Weight calculation: inverse exponential weighting to simulate realistic distribution
        for (let i = 0; i < slicesToShow; i++) {
          // Exponential decay formula gives more weight to earlier elements
          const weight = Math.pow(0.85, i) * 10;
          weights[i.toString()] = weight;
          totalWeight += weight;
        }
        
        // Calculate "Others" weight if needed
        let othersWeight = 0;
        if (showOthers) {
          // Assign remaining stocks a smaller weight
          for (let i = MAX_SLICES; i < totalStocks; i++) {
            const weight = Math.pow(0.85, i) * 10;
            othersWeight += weight;
          }
          totalWeight += othersWeight;
        }
        
        // Convert to percentages and populate series/labels
        for (let i = 0; i < slicesToShow; i++) {
          const key = i.toString();
          const percentage = (weights[key] / totalWeight) * 100;
          series.push(percentage);
          labels.push(nameObj[key]);
        }
        
        // Add "Others" category if needed
        if (showOthers) {
          const percentage = (othersWeight / totalWeight) * 100;
          series.push(percentage);
          labels.push(`Others (${totalStocks - MAX_SLICES})`);
          
          // Add a gray color for "Others"
          colors = generateColors(slicesToShow);
          colors.push("#A0A0A0"); // Gray for "Others"
        } else {
          colors = generateColors(slicesToShow);
        }
      }
      // If we have a different object format, try to extract name-value pairs
      else {
        // Identify potential name and value fields in the object
        const possibleNameKeys = ['name', 'label', 'category', 'title'];
        const possibleValueKeys = ['value', 'weight', 'percentage', 'count', 'size'];
        
        const entries = Object.entries(item.data);
        
        // Extract or construct name-value pairs if possible
        entries.forEach(([key, value]) => {
          if (typeof value === 'number') {
            labels.push(key);
            series.push(value);
          } else if (typeof value === 'object' && value !== null) {
            // Try to find name and value fields
            let name = "";
            let numValue = 0;
            
            // Look for name
            for (const nameKey of possibleNameKeys) {
              if (value[nameKey] !== undefined) {
                name = value[nameKey];
                break;
              }
            }
            
            // Look for value
            for (const valueKey of possibleValueKeys) {
              if (value[valueKey] !== undefined && typeof value[valueKey] === 'number') {
                numValue = value[valueKey];
                break;
              }
            }
            
            // If we found both, add them
            if (name && numValue) {
              labels.push(name);
              series.push(numValue);
            }
          }
        });
      }
    }
  
    // If still no valid data found, provide a message
    if (series.length === 0) {
      console.warn("No valid data found for pie chart. Using mock data.");
      
      // Create demo data
      labels = ["No valid data found", "Please check data format"];
      series = [70, 30];
      colors = ["#D3D3D3", "#A9A9A9"]; // Light gray and dark gray
      
      // Update metadata
      metadata = {
        ...metadata,
        title: "Data Format Issue",
        description: "The pie chart component couldn't interpret the provided data format."
      };
    }
  
    const pieData: PieData = {
      series,
      labels,
      colors: colors.length > 0 ? colors : undefined
    };
  
    return {
      type: "PIE",
      data: pieData,
      metadata: {
        ...metadata,
        showLegend: true,
        showLabels: true,
        showTotal: true,
        donut: metadata.donut || false,
        enableGradient: series.length <= 10 // Only use gradient for smaller datasets
      },
    };
  }
  
  /**
   * Generates a pleasing color palette for pie chart slices
   * @param count Number of colors needed
   * @returns Array of hex color codes
   */
  function generateColors(count: number): string[] {
    // Base colors for a professional-looking palette
    const baseColors = [
      "#4F87C5", // Blue
      "#6EAF89", // Green
      "#CC6B73", // Red
      "#8E74BB", // Purple
      "#E19052", // Orange
      "#71A8D7", // Light Blue
      "#88C7A0", // Light Green
      "#D6868E", // Light Red
      "#A487CA", // Light Purple
      "#EEA877", // Light Orange
      "#5D9AD3", // Another Blue
      "#7BBF96", // Another Green
      "#D7787F", // Another Red
      "#9B82C7", // Another Purple
      "#E9A05E"  // Another Orange
    ];
    
    // If we need more colors than base palette, generate variations
    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    } else {
      // Create variations of the base colors by adjusting brightness
      const colors = [...baseColors];
      const remaining = count - baseColors.length;
      
      for (let i = 0; i < remaining; i++) {
        const baseColor = baseColors[i % baseColors.length];
        
        // Lighten the color a bit for the variation
        const variation = lightenColor(baseColor, 15);
        colors.push(variation);
      }
      
      return colors;
    }
  }
  
  /**
   * Lightens a hex color by the specified amount
   * @param hex Hex color code
   * @param amount Amount to lighten (0-100)
   * @returns Lightened hex color
   */
  function lightenColor(hex: string, amount: number): string {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse the hex color
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    
    // Lighten by the specified amount
    r = Math.min(255, r + Math.round((255 - r) * (amount / 100)));
    g = Math.min(255, g + Math.round((255 - g) * (amount / 100)));
    b = Math.min(255, b + Math.round((255 - b) * (amount / 100)));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  

/**
 * Maps table data
 */
/**
 * Maps table data, handling both array format and column-based object format
 * @param item The API response item
 * @param metadata Basic metadata for the tile
 * @returns A formatted Tile object for table visualization
 */
function mapTableData(item: any, metadata: any): Tile {
    let tableData: TableData[] = [];

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

    // Determine column types for better display formatting
    const columnTypes = inferColumnTypes(tableData);
    const columnOrder = determineColumnOrder(tableData);

    // Extract key metrics for summary display
    const tableSummary = generateTableSummary(tableData, columnTypes);

    return {
        type: "TABLE",
        data: tableData,
        metadata: {
            ...metadata,
            fullWidth: true, // Tables usually look better in full width
            columnTypes, 
            columnOrder,
            summary: tableSummary
        },
    };
}

/**
 * Checks if the data has a column-based indexed format
 * @param data The data object to check
 * @returns true if data is in column-based indexed format
 */
function hasIndexedObjectFormat(data: any): boolean {
    // At least one column is required
    if (Object.keys(data).length === 0) return false;
    
    // Get the first column
    const firstColumn = Object.values(data)[0];
    
    // Check if it's an object with numeric indices
    return typeof firstColumn === 'object' && 
           firstColumn !== null && 
           !Array.isArray(firstColumn) &&
           Object.keys(firstColumn).some(key => !isNaN(parseInt(key)));
}

/**
 * Transforms column-wise data to row-wise format
 * @param data The column-based data object
 * @returns An array of row objects
 */
function transformColumnWiseToRowWise(data: any): any[] {
    if (!data || typeof data !== 'object') {
        console.warn("No valid table data found");
        return [];
    }
    
    const columnNames = Object.keys(data);
    const rowCount = getRowCount(data);
    const rows = [];
    
    // Create an object for each row
    for (let i = 0; i < rowCount; i++) {
        const row: any = {};
        
        // Add each column to the row
        columnNames.forEach(column => {
            if (data[column] && data[column][i.toString()] !== undefined) {
                row[column] = data[column][i.toString()];
            }
        });
        
        rows.push(row);
    }
    
    return rows;
}

/**
 * Gets the number of rows from the first column
 * @param data The column-based data object
 * @returns The number of rows
 */
function getRowCount(data: any): number {
    const firstColumn = Object.values(data)[0];
    if (!firstColumn || typeof firstColumn !== 'object') return 0;
    
    return Object.keys(firstColumn).length;
}

/**
 * Infers column types based on data content
 * @param rows The array of row objects
 * @returns An object mapping column names to their inferred types
 */
function inferColumnTypes(rows: any[]): { [key: string]: string } {
    if (!rows || rows.length === 0) return {};
    
    const columns = Object.keys(rows[0] || {});
    const columnTypes: { [key: string]: string } = {};
    
    columns.forEach(column => {
        // Check the first 10 entries (or fewer if array is shorter)
        const sampleSize = Math.min(10, rows.length);
        let numericCount = 0;
        let dateCount = 0;
        let percentCount = 0;
        let currencyCount = 0;
        
        for (let i = 0; i < sampleSize; i++) {
            if (!rows[i]) continue;
            
            const value = rows[i][column];
            if (value === undefined || value === null) continue;
            
            const stringValue = String(value).trim();
            
            // Check if it's a percentage
            if (stringValue.endsWith('%')) {
                percentCount++;
                continue;
            }
            
            // Check if it's a currency
            if (/^[$€£¥]/.test(stringValue) || 
                /^\d+(\.\d+)?\s*(USD|EUR|GBP|JPY|CNY)$/.test(stringValue)) {
                currencyCount++;
                continue;
            }
            
            // Check if it's a number
            if (!isNaN(parseFloat(stringValue)) && isFinite(Number(stringValue))) {
                numericCount++;
                continue;
            }
            
            // Check if it's a date (simplified check)
            if (typeof stringValue === 'string' && 
                (/^\d{4}[-./]\d{1,2}[-./]\d{1,2}/.test(stringValue) || 
                 /^\d{1,2}[-./]\d{1,2}[-./]\d{4}/.test(stringValue))) {
                dateCount++;
                continue;
            }
        }
        
        // Determine which data type fits best
        if (percentCount > sampleSize * 0.5) {
            columnTypes[column] = 'percent';
        } else if (currencyCount > sampleSize * 0.5) {
            columnTypes[column] = 'currency';
        } else if (numericCount > sampleSize * 0.5) {
            columnTypes[column] = 'number';
        } else if (dateCount > sampleSize * 0.5) {
            columnTypes[column] = 'date';
        } else {
            // Special case handling
            if (column.toLowerCase().includes('name') || 
                column.toLowerCase().includes('title') ||
                column.toLowerCase().includes('description')) {
                columnTypes[column] = 'text';
            } else if (column.toLowerCase().includes('date') || 
                      column.toLowerCase().includes('time')) {
                columnTypes[column] = 'date';
            } else if (column.toLowerCase().includes('price') || 
                      column.toLowerCase().includes('cost') ||
                      column.toLowerCase().includes('amount')) {
                columnTypes[column] = 'currency';
            } else if (column.toLowerCase().includes('percent') || 
                      column.toLowerCase().includes('ratio') ||
                      column.toLowerCase().includes('rate')) {
                columnTypes[column] = 'percent';
            } else {
                columnTypes[column] = 'text';
            }
        }
    });
    
    return columnTypes;
}

/**
 * Determines the logical order for columns
 * @param rows The array of row objects
 * @returns An array of column names in preferred display order
 */
function determineColumnOrder(rows: any[]): string[] {
    if (!rows || rows.length === 0) return [];
    
    const columns = Object.keys(rows[0] || {});
    
    // Define priority rules for column ordering
    const priorityPrefixes = [
        'name', 'title', 'id', 'code', 'symbol', 
        'date', 'time', 'period',
        'price', 'value', 'amount', 'cost',
        'percent', 'ratio', 'rate'
    ];
    
    // Sort columns based on priority rules
    return columns.sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        
        // Check if either column starts with a priority prefix
        for (const prefix of priorityPrefixes) {
            const aHasPrefix = aLower.startsWith(prefix) || aLower.includes(prefix);
            const bHasPrefix = bLower.startsWith(prefix) || bLower.includes(prefix);
            
            if (aHasPrefix && !bHasPrefix) return -1;
            if (!aHasPrefix && bHasPrefix) return 1;
        }
        
        // Default to alphabetical order
        return aLower.localeCompare(bLower);
    });
}

/**
 * Generates summary statistics for the table
 * @param rows The array of row objects
 * @param columnTypes The inferred column types
 * @returns Summary statistics for numeric columns
 */
function generateTableSummary(rows: any[], columnTypes: { [key: string]: string }): any {
    if (!rows || rows.length === 0) return {};
    
    const summary: any = {
        rowCount: rows.length,
        columns: {}
    };
    
    // For each numeric/percent/currency column, calculate min, max, avg
    Object.entries(columnTypes).forEach(([column, type]) => {
        if (type === 'number' || type === 'percent' || type === 'currency') {
            const values = rows
                .map(row => {
                    const val = row[column];
                    if (val === undefined || val === null) return NaN;
                    
                    // Remove any non-numeric characters (e.g., $, %, etc.)
                    const numStr = String(val).replace(/[^0-9.-]/g, '');
                    return parseFloat(numStr);
                })
                .filter(val => !isNaN(val));
            
            if (values.length > 0) {
                summary.columns[column] = {
                    min: Math.min(...values),
                    max: Math.max(...values),
                    avg: values.reduce((sum, val) => sum + val, 0) / values.length
                };
            }
        }
    });
    
    return summary;
}