"use client"

import { useState, useEffect } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { TableData } from "@/types/dashboard"

interface DataTableProps {
  tableData: TableData[]
  metadata?: {
    title?: string
    description?: string
    fullWidth?: boolean
  }
}

type SortField = "date" | "open" | "high" | "low" | "close" | "volume"
type SortDirection = "asc" | "desc"

export default function DataTable({ tableData = [], metadata }: DataTableProps) {
  const [data, setData] = useState<any[]>([])
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  useEffect(() => {
    if (tableData && tableData.length > 0) {
      setData(tableData)
    } else {
      setData([])
    }
  }, [tableData])

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (sortField === "date") {
      return sortDirection === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime()
    } else {
      return sortDirection === "asc" ? a[sortField] - b[sortField] : b[sortField] - a[sortField]
    }
  })

  // Calculate daily change and percentage
  const dataWithChanges = sortedData.map((item, index) => {
    const prevDay = sortedData[index + 1]
    const change = prevDay ? item.close - prevDay.close : 0
    const changePercent = prevDay ? (change / prevDay.close) * 100 : 0
    return {
      ...item,
      change,
      changePercent,
    }
  })

  const formatPrice = (price: number | string | undefined) => {
    if (price === undefined) return "-"
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(numericPrice)) return "-"
    return numericPrice.toFixed(2)
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return (volume / 1000000).toFixed(2) + "M"
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(2) + "K"
    }
    return volume?.toLocaleString()
  }

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
    return sortDirection === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
  }

  const title = metadata?.title || "Marktdaten"
  const description = metadata?.description || "Historische Aktienkursinformationen"

  return (
    <Card className="border-slate-200 shadow-md">
      <CardHeader className="bg-slate-50 border-b border-slate-200 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10">
        <CardTitle className="text-slate-800 text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-2">
        {data.length === 0 ? (
          <div className="p-4 text-center text-slate-500">
            Keine Daten verfügbar
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {["date", "open", "high", "low", "close", "volume"].map((field) => (
                    <TableHead
                      key={field}
                      onClick={() => handleSort(field as SortField)}
                      className="cursor-pointer text-right font-semibold text-slate-700"
                    >
                      <div className="flex items-center justify-end">
                        {field.toUpperCase()} {getSortIcon(field as SortField)}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="font-semibold text-slate-700 text-right">Veränderung</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataWithChanges.slice(0, 10).map((item, index) => (
                  <TableRow key={index} className="hover:bg-slate-50 border-b border-slate-100">
                    <TableCell>
                      {new Date(item.date).toLocaleDateString("de-DE")}
                    </TableCell>
                    <TableCell className="text-right">{formatPrice(item.open)}</TableCell>
                    <TableCell className="text-right">{formatPrice(item.high)}</TableCell>
                    <TableCell className="text-right">{formatPrice(item.low)}</TableCell>
                    <TableCell className="text-right">{formatPrice(item.close)}</TableCell>
                    <TableCell className="text-right">{formatVolume(item.volume)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className={cn(
                          item.change > 0 ? "text-emerald-600" : item.change < 0 ? "text-red-600" : "text-slate-500"
                        )}>
                          {item.change > 0 ? "+" : ""}
                          {formatPrice(item.change)}
                        </span>
                        <span className={cn(
                          item.changePercent > 0 ? "text-emerald-600" : item.changePercent < 0 ? "text-red-600" : "text-slate-500"
                        )}>
                          {item.changePercent > 0 ? "+" : ""}
                          {item.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* <CardFooter className="py-1.5 px-4 border-t border-slate-200 bg-slate-50 flex justify-between bg-gradient-to-br from-indigo-500/10 to-cyan-500/10">
          <div className="py-2">
          </div>
        </CardFooter> */}
    </Card>
  )
}