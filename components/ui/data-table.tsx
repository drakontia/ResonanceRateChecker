"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  OnChangeFn,
  useReactTable,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchQuery?: string
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchQuery = "",
  sorting: controlledSorting,
  onSortingChange,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const sorting = controlledSorting ?? internalSorting
  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const nextSorting = typeof updater === "function" ? updater(sorting) : updater
    onSortingChange?.(nextSorting)
    if (controlledSorting === undefined) {
      setInternalSorting(nextSorting)
    }
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    enableMultiSort: false,
    state: {
      sorting,
      columnFilters,
      globalFilter: searchQuery,
    },
  })

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto rounded-md border">
        <Table className="w-max">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={header.id === "goodsJp" ? "sticky top-0 left-0 bg-background min-w-[150px] z-20 border-r" : "sticky top-0 w-32 bg-background z-10"}
                  style={{ boxShadow: '0 2px 2px -1px rgba(0, 0, 0, 0.1)' }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cell.column.id === "goodsJp" ? "sticky left-0 bg-background z-10" : "bg-background"}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                結果がありません
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        </Table>
      </div>
    </div>
  )
}
