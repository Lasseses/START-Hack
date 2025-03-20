"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface DataTableProps {
  tableData: {
    date: string
    open: number
    high: number
    low: number
    close: number
    volume: number
  }[]
}

type SortField = "date" | "open" | "high" | "low" | "close" | "volume"
type SortDirection = "asc" | "desc"

export default function DataTable({ tableData }: DataTableProps) {
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const sortedData = [...tableData].sort((a, b) => {
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

  const formatPrice = (price: number) => {
    return price.toFixed(2)
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return (volume / 1000000).toFixed(2) + "M"
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(2) + "K"
    }
    return volume.toLocaleString()
  }

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
    return sortDirection === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
  }

  return (
    <Card className="border-slate-200 shadow-md">
      <CardHeader className="bg-slate-50 border-b border-slate-200">
        <CardTitle className="text-slate-800 text-xl">Market Data</CardTitle>
        <CardDescription>Historical stock price information</CardDescription>
      </CardHeader>
      <CardContent className="p-2">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader >
              <TableRow className="hover:bg-slate-100">
                <TableHead className="font-semibold text-slate-700 cursor-pointer" onClick={() => handleSort("date")}>
                  <div className="flex items-center">Date {getSortIcon("date")}</div>
                </TableHead>
                <TableHead
                  className="font-semibold text-slate-700 cursor-pointer text-right"
                  onClick={() => handleSort("open")}
                >
                  <div className="flex items-center justify-end">Open {getSortIcon("open")}</div>
                </TableHead>
                <TableHead
                  className="font-semibold text-slate-700 cursor-pointer text-right"
                  onClick={() => handleSort("high")}
                >
                  <div className="flex items-center justify-end">High {getSortIcon("high")}</div>
                </TableHead>
                <TableHead
                  className="font-semibold text-slate-700 cursor-pointer text-right"
                  onClick={() => handleSort("low")}
                >
                  <div className="flex items-center justify-end">Low {getSortIcon("low")}</div>
                </TableHead>
                <TableHead
                  className="font-semibold text-slate-700 cursor-pointer text-right"
                  onClick={() => handleSort("close")}
                >
                  <div className="flex items-center justify-end">Close {getSortIcon("close")}</div>
                </TableHead>
                <TableHead
                  className="font-semibold text-slate-700 cursor-pointer text-right"
                  onClick={() => handleSort("volume")}
                >
                  <div className="flex items-center justify-end">Volume {getSortIcon("volume")}</div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataWithChanges.slice(0, 10).map((item, index) => (
                <TableRow key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium text-slate-700">
                    {new Date(item.date).toLocaleDateString("de-DE", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-right font-mono text-slate-700">{formatPrice(item.open)}</TableCell>
                  <TableCell className="text-right font-mono text-slate-700">{formatPrice(item.high)}</TableCell>
                  <TableCell className="text-right font-mono text-slate-700">{formatPrice(item.low)}</TableCell>
                  <TableCell className="text-right font-mono text-slate-700">{formatPrice(item.close)}</TableCell>
                  <TableCell className="text-right font-mono text-slate-700">{formatVolume(item.volume)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span
                        className={cn(
                          "font-mono",
                          item.change > 0 ? "text-emerald-600" : item.change < 0 ? "text-red-600" : "text-slate-500",
                        )}
                      >
                        {item.change > 0 ? "+" : ""}
                        {formatPrice(item.change)}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-mono",
                          item.changePercent > 0
                            ? "text-emerald-600"
                            : item.changePercent < 0
                              ? "text-red-600"
                              : "text-slate-500",
                        )}
                      >
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
      </CardContent>
    </Card>
  )
}

