"use client"

import { useState, useRef, useCallback } from "react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, Columns3, Download, Search, LayoutGrid, List } from "lucide-react"
import { TableSkeleton } from "./table-skeleton"
import { Pagination } from "@/components/common/pagination"
import { RecordCountBadges, type RecordCount } from "@/components/common/record-count-badges"

interface ServerPagination {
  page: number
  totalPages: number
  total: number
  limit: number
}

interface TotalCounts {
  total: number
  active?: number
  inactive?: number
  warning?: number
  activeLabel?: string
  inactiveLabel?: string
  warningLabel?: string
  counts?: RecordCount[]
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  onExport?: () => void
  onImport?: () => void
  hideSearch?: boolean
  rowSelection?: Record<string, boolean>
  onRowSelectionChange?: (selection: Record<string, boolean>) => void
  getRowId?: (row: TData) => string
  serverPagination?: ServerPagination
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  onSearchChange?: (search: string) => void
  searchValue?: string
  isLoading?: boolean
  enableViewToggle?: boolean
  filters?: React.ReactNode
  totalCounts?: TotalCounts
  footerLeft?: React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey = "name",
  searchPlaceholder = "Search...",
  onExport,
  onImport,
  hideSearch = false,
  rowSelection: externalRowSelection,
  onRowSelectionChange: externalOnRowSelectionChange,
  getRowId,
  serverPagination,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  searchValue,
  isLoading = false,
  enableViewToggle = true,
  filters,
  totalCounts,
  footerLeft,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [internalRowSelection, setInternalRowSelection] = useState({})
  const [localSearch, setLocalSearch] = useState(searchValue ?? "")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const onSearchChangeRef = useRef(onSearchChange)
  onSearchChangeRef.current = onSearchChange

  const rowSelection = externalRowSelection ?? internalRowSelection
  const onRowSelectionChange = externalOnRowSelectionChange
    ? (updater: unknown) => {
      const next = typeof updater === "function" ? (updater as (old: Record<string, boolean>) => Record<string, boolean>)(rowSelection) : updater as Record<string, boolean>
      externalOnRowSelectionChange(next)
    }
    : setInternalRowSelection

  // Pass search to parent immediately — parent handles debounce
  const handleSearchInput = useCallback((value: string) => {
    setLocalSearch(value)
    onSearchChangeRef.current?.(value)
  }, [])

  const [internalPagination, setInternalPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const pagination = serverPagination
    ? {
        pageIndex: (serverPagination.page ?? 1) - 1,
        pageSize: serverPagination.limit ?? 10,
      }
    : internalPagination

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: serverPagination ? undefined : getPaginationRowModel(),
    manualPagination: !!serverPagination,
    manualFiltering: true,
    manualSorting: true,
    pageCount: serverPagination?.totalPages ?? undefined,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange,
    onPaginationChange: serverPagination ? undefined : setInternalPagination,
    ...(getRowId && { getRowId }),
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  const currentPage = serverPagination
    ? (serverPagination.page ?? 1)
    : (table.getState().pagination.pageIndex + 1)
  const totalPages = serverPagination
    ? (serverPagination.totalPages ?? 1)
    : table.getPageCount()

  return (
    <div className="space-y-4">
      {!hideSearch && (
        <div className="flex items-center justify-between gap-4 w-full overflow-x-auto pb-1 lg:overflow-visible no-scrollbar">
          <div className="relative flex-1 min-w-[200px] max-w-[450px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(event) => handleSearchInput(event.target.value)}
              className="pl-9 h-[44px] bg-white border-gray-100 rounded-lg shadow-sm focus-visible:ring-emerald-500 text-[14px]"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {filters && (
              <div className="flex items-center gap-2 shrink-0">
                {filters}
              </div>
            )}
            {enableViewToggle && (
              <div className="flex items-center gap-1 bg-gray-50/80 p-1.5 rounded-lg border border-gray-100 hidden sm:flex h-[44px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-8 w-8 p-0 hover:bg-white hover:shadow-sm", viewMode === "list" && "bg-white shadow-sm text-gray-900 border border-gray-200/50")}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-8 w-8 p-0 hover:bg-white hover:shadow-sm", viewMode === "grid" && "bg-white shadow-sm text-gray-900 border border-gray-200/50")}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex h-[44px] gap-2 text-gray-500 rounded-lg border border-gray-100 shadow-sm bg-white">
                  <Columns3 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            {onExport && (
              <Button variant="ghost" size="sm" className="h-11 text-gray-500" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className={cn("rounded-xl border border-gray-100 bg-white shadow-sm", viewMode === "list" ? "overflow-x-auto" : "p-6 bg-gray-50/30")}>
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton columns={columns.length} rows={serverPagination?.limit ?? 10} />
          </div>
        ) : viewMode === "list" ? (
          <Table className="w-full">
            <TableHeader className="bg-[#FAFAFA] whitespace-nowrap">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-gray-100">
                  {headerGroup.headers.map((header) => {
                    const align = (header.column.columnDef.meta as any)?.align || "left"
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "h-12 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider transition-colors",
                          header.column.id === "actions" && "text-right sticky right-0 z-10 bg-[#fafafa] border-l border-gray-100 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]"
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-1.5 cursor-pointer select-none transition-colors hover:text-gray-900",
                            header.column.getIsSorted() && "text-gray-900",
                            align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <ChevronDown
                              className={cn(
                                "h-3.5 w-3.5 transition-transform duration-200",
                                header.column.getIsSorted() === "asc" ? "rotate-180" : "rotate-0",
                                !header.column.getIsSorted() && "opacity-30"
                              )}
                            />
                          )}
                        </div>
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="group bg-white hover:bg-[#FAFAFA]">
                    {row.getVisibleCells().map((cell) => {
                      const align = (cell.column.columnDef.meta as any)?.align || "left"
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "px-6 py-4",
                            align === "left" && "!text-left",
                            align === "right" && "!text-right",
                            cell.column.id === "actions" && "text-right sticky right-0 z-10 bg-white group-hover:bg-[#FAFAFA] group-data-[state=selected]:bg-muted transition-colors border-l border-gray-100 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]"
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => {
                const visibleCells = row.getVisibleCells()
                const actionCell = visibleCells.find(c => c.column.id === "actions")

                return (
                  <div key={row.id} className="rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all flex flex-col p-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex flex-col gap-4 flex-1">
                      {visibleCells.map((cell, i) => {
                        if (cell.column.id === "actions" || cell.column.id === "select") return null

                        const renderContent = flexRender(cell.column.columnDef.cell, cell.getContext())
                        const headerObj = cell.column.columnDef.header
                        const headerLabel = typeof headerObj === 'string' ? headerObj : cell.column.id

                        if (i === (visibleCells[0].column.id === "select" ? 1 : 0)) {
                          return (
                            <div key={cell.id} className="font-bold text-[16px] text-gray-900 border-b border-gray-50 pb-4">
                              {renderContent}
                            </div>
                          )
                        }

                        return (
                          <div key={cell.id} className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                              {headerLabel}
                            </span>
                            <div className="text-[13px] font-medium text-gray-700 break-words">
                              {renderContent}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {actionCell && (
                      <div className="mt-5 pt-4 border-t border-gray-50 flex justify-end items-center z-10 relative bg-white">
                        {flexRender(actionCell.column.columnDef.cell, actionCell.getContext())}
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="col-span-full p-12 text-center text-sm text-gray-400 bg-white border border-gray-100 rounded-xl shadow-sm">
                No results found.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2 py-1">
        <div className="flex flex-wrap items-center gap-2">
          {totalCounts && (
            <div className="flex items-center gap-2 mr-4">
              <RecordCountBadges counts={totalCounts.counts ?? [
                { label: "Total", value: totalCounts.total ?? 0 },
                ...(totalCounts.active !== undefined ? [{ label: totalCounts.activeLabel ?? "Active", value: totalCounts.active, color: "green" as const }] : []),
                ...(totalCounts.inactive !== undefined ? [{ label: totalCounts.inactiveLabel ?? "Inactive", value: totalCounts.inactive }] : []),
                ...(totalCounts.warning !== undefined ? [{ label: totalCounts.warningLabel ?? "Warning", value: totalCounts.warning, color: "red" as const }] : []),
              ]} />
            </div>
          )}
          {footerLeft}
          {table.getSelectedRowModel().rows.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {table.getSelectedRowModel().rows.length} of {serverPagination?.total ?? data.length} row(s)
              selected
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4 ml-auto">
          {(onPageSizeChange || !serverPagination) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap font-medium">Rows per page</span>
              <Select
                value={String(serverPagination?.limit ?? table.getState().pagination.pageSize)}
                onValueChange={(value) => {
                  if (serverPagination) {
                    onPageSizeChange?.(Number(value))
                  } else {
                    table.setPageSize(Number(value))
                  }
                }}
              >
                <SelectTrigger className="h-9 w-[70px] bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="text-sm text-muted-foreground font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            Page {currentPage} of {totalPages}
          </div>
          <Pagination page={currentPage} totalPages={Math.max(totalPages, 1)} onPageChange={(nextPage) => {
            if (serverPagination) onPageChange?.(nextPage)
            else if (nextPage > currentPage) table.nextPage()
            else table.previousPage()
          }} />
        </div>
      </div>
    </div>
  )
}

