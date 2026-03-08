'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RetentionData } from '@/lib/actions/analytics'

interface RetentionTableProps {
  data: RetentionData[]
}

export function RetentionTable({ data }: RetentionTableProps) {
  const getRetentionColor = (value: number) => {
    if (value >= 50) return 'text-green-600 bg-green-50'
    if (value >= 30) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>群组</TableHead>
            <TableHead className="text-center">D1 留存</TableHead>
            <TableHead className="text-center">D7 留存</TableHead>
            <TableHead className="text-center">D30 留存</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                暂无数据
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.cohort}>
                <TableCell className="font-medium">{row.cohort}</TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-block px-2 py-1 rounded text-sm font-medium ${getRetentionColor(
                      row.day1
                    )}`}
                  >
                    {row.day1}%
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-block px-2 py-1 rounded text-sm font-medium ${getRetentionColor(
                      row.day7
                    )}`}
                  >
                    {row.day7}%
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-block px-2 py-1 rounded text-sm font-medium ${getRetentionColor(
                      row.day30
                    )}`}
                  >
                    {row.day30}%
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
