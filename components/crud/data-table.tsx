'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Trash2,
  Edit,
  Plus,
  Search,
} from 'lucide-react'

interface Column<T> {
  key: keyof T
  label: string
  render?: (value: T[keyof T], item: T) => React.ReactNode
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[]
  data: T[]
  onAdd: () => void
  onEdit: (item: T) => void
  onDelete: (id: string) => void
  title: string
  searchableFields?: (keyof T)[]
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  title,
  searchableFields = [],
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')

  const filteredData = data.filter((item) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return searchableFields.some((field) => {
      const value = item[field]
      return value && String(value).toLowerCase().includes(searchLower)
    })
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${title.toLowerCase()}...`}
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={onAdd} className="w-full gap-2 sm:w-auto">
          <Plus className="h-4 w-4" />
          Add {title}
        </Button>
      </div>

      {filteredData.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No {title.toLowerCase()} found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table className="min-w-[42rem]">
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={String(column.key)}>
                    {column.label}
                  </TableHead>
                ))}
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      {column.render
                        ? column.render(item[column.key], item)
                        : String(item[column.key])}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
