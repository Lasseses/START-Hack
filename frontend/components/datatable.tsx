"use client"

import { useState, useEffect } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { transformColumnWiseToRowWise } from "@/utils/tableMapper"

interface TableDataObject {
  [key: string]: any
}

interface DataTableProps {
  tableData: any // Can be an array of objects or a column-wise object
  metadata?: {
    title?: string
    fullWidth?: boolean
    columnTypes?: { [key: string]: string }
    columnOrder?: string[]
  }
}

type SortDirection = "asc" | "desc"

export default function DynamicDataTable({ tableData = [], metadata }: DataTableProps) {
  const [data, setData] = useState<TableDataObject[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [sortField, setSortField] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [columnTypes, setColumnTypes] = useState<{[key: string]: string}>({})

  useEffect(() => {
    if (!tableData) return;
    
    // Process data if it's in column-wise format
    let processedData = Array.isArray(tableData) 
      ? tableData 
      : transformColumnWiseToRowWise(tableData);
    
    setData(processedData);
    
    // Set columns from data or metadata
    if (processedData.length > 0) {
      if (metadata?.columnOrder && metadata.columnOrder.length > 0) {
        setColumns(metadata.columnOrder);
      } else {
        setColumns(Object.keys(processedData[0]));
      }

      // Set default sort field to first column if not yet set
      if (!sortField && Object.keys(processedData[0]).length > 0) {
        setSortField(Object.keys(processedData[0])[0]);
      }
    }

    // Use metadata column types or defaults
    if (metadata?.columnTypes) {
      setColumnTypes(metadata.columnTypes);
    }
  }, [tableData, metadata, sortField]);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!a[sortField] && !b[sortField]) return 0;
    if (!a[sortField]) return 1;
    if (!b[sortField]) return -1;

    const type = columnTypes[sortField] || 'text';
    
    // Handle different types of data
    if (type === 'date') {
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }
    else if (type === 'number' || type === 'currency' || type === 'percent' || type === 'volume') {
      const numA = parseNumericValue(a[sortField]);
      const numB = parseNumericValue(b[sortField]);
      return sortDirection === "asc" ? numA - numB : numB - numA;
    }
    else {
      // String comparison
      const strA = String(a[sortField]).toLowerCase();
      const strB = String(b[sortField]).toLowerCase();
      return sortDirection === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
    }
  });

  const parseNumericValue = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleanStr = value.replace(/[^0-9.-]/g, '');
      return parseFloat(cleanStr) || 0;
    }
    return 0;
  };

  const formatCellContent = (value: any, columnName: string) => {
    if (value === null || value === undefined) return "-";
    
    const type = columnTypes[columnName] || 'text';
    
    switch (type) {
      case 'currency':
        return formatCurrency(value);
      case 'percent':
        return formatPercent(value);
      case 'volume':
        return formatVolume(value);
      case 'date':
        return formatDate(value);
      case 'code':
        return value.toString().toUpperCase();
      default:
        return value;
    }
  };

  const formatCurrency = (value: any) => {
    const num = parseNumericValue(value);
    return num.toFixed(2);
  };

  const formatPercent = (value: any) => {
    const num = parseNumericValue(value);
    return String(value).includes('%') ? value : `${num.toFixed(2)}%`;
  };

  const formatVolume = (value: any) => {
    const num = parseNumericValue(value);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + "K";
    }
    return num.toLocaleString();
  };

  const formatDate = (value: any) => {
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return value;
    }
  };

  const getSortIcon = (field: string) => {
    if (field !== sortField) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    return sortDirection === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  const formatColumnHeader = (column: string) => {
    return column
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  };

  const getColumnAlignment = (column: string) => {
    const type = columnTypes[column] || 'text';
    
    if (type === 'number' || type === 'currency' || type === 'percent' || type === 'volume') {
      return "right";
    } else if (type === 'date') {
      return "center";
    }
    return "left";
  };

  const title = metadata?.title || "Data Table";

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      {title && (
        <CardHeader className="bg-white border-b py-3 px-4">
          <CardTitle className="text-lg font-medium text-slate-800">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No data available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-slate-50">
                  {columns.map((column) => (
                    <TableHead
                      key={column}
                      onClick={() => handleSort(column)}
                      className={cn(
                        "cursor-pointer py-3 px-4 text-xs font-semibold uppercase tracking-wide text-slate-700 whitespace-nowrap",
                        getColumnAlignment(column) === "right" ? "text-right" : 
                        getColumnAlignment(column) === "center" ? "text-center" : "text-left"
                      )}
                    >
                      <div className={cn(
                        "flex items-center",
                        getColumnAlignment(column) === "right" ? "justify-end" : 
                        getColumnAlignment(column) === "center" ? "justify-center" : "justify-start"
                      )}>
                        {formatColumnHeader(column)} {getSortIcon(column)}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((item, index) => (
                  <TableRow key={index} className="hover:bg-slate-50 border-b border-slate-100">
                    {columns.map((column) => (
                      <TableCell 
                        key={`${index}-${column}`}
                        className={cn(
                          "py-3 px-4",
                          getColumnAlignment(column) === "right" ? "text-right" : 
                          getColumnAlignment(column) === "center" ? "text-center" : "text-left"
                        )}
                      >
                        {formatCellContent(item[column], column)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}