// src/components/RecentTransactions.tsx
import type { Fund } from "@/api/fund"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate, formatRM } from "@/lib/utils"

export function RecentFunds({ data }: { data: Fund[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Funds Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fund</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Expired</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="font-medium">{txn.name}</TableCell>
                <TableCell>{formatRM(txn.amount)}</TableCell>
                <TableCell className="text-right">
                  {formatDate(txn.expired)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
