"use client"

import { useState, useMemo } from "react"
import { LucideIcon, Inbox } from "lucide-react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export type Column<T> = {
  key: string
  header: string
  className?: string
  render: (row: T, index: number) => React.ReactNode
}

type DataTableProps<T> = {
  columns: Column<T>[]
  data: T[]
  pageSize?: number
  emptyIcon?: LucideIcon
  emptyMessage?: string
  rowKey: (row: T, index: number) => string | number
}

export function DataTable<T>({
  columns,
  data,
  pageSize = 15,
  emptyIcon: EmptyIcon = Inbox,
  emptyMessage = "Sin datos disponibles.",
  rowKey,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize))
  const safeCurrentPage = Math.min(page, totalPages)

  const pageData = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return data.slice(start, start + pageSize)
  }, [data, safeCurrentPage, pageSize])

  if (safeCurrentPage !== page) setPage(safeCurrentPage)

  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (safeCurrentPage > 3) pages.push("ellipsis")
      const start = Math.max(2, safeCurrentPage - 1)
      const end = Math.min(totalPages - 1, safeCurrentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (safeCurrentPage < totalPages - 2) pages.push("ellipsis")
      pages.push(totalPages)
    }
    return pages
  }, [totalPages, safeCurrentPage])

  if (data.length === 0) {
    return (
      <Empty className="py-12">
        <EmptyMedia variant="icon">
          <EmptyIcon />
        </EmptyMedia>
        <EmptyTitle>{emptyMessage}</EmptyTitle>
      </Empty>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageData.map((row, i) => (
            <TableRow key={rowKey(row, i)}>
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>
                  {col.render(row, i)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {(safeCurrentPage - 1) * pageSize + 1}-{Math.min(safeCurrentPage * pageSize, data.length)} de {data.length}
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); setPage(Math.max(1, safeCurrentPage - 1)) }}
                  aria-disabled={safeCurrentPage === 1}
                  className={safeCurrentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {pageNumbers.map((p, i) =>
                p === "ellipsis" ? (
                  <PaginationItem key={`e${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === safeCurrentPage}
                      onClick={(e) => { e.preventDefault(); setPage(p) }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); setPage(Math.min(totalPages, safeCurrentPage + 1)) }}
                  aria-disabled={safeCurrentPage === totalPages}
                  className={safeCurrentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
