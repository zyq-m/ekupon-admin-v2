// src/components/RecentTransactions.tsx
import type { TfComplete } from "@/api/transaction"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatRM } from "@/lib/utils"

export function RecentTransactions({ data }: { data: TfComplete[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Cafe</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="font-medium">
                  {txn.student.name}
                </TableCell>
                <TableCell>{formatRM(txn.amount)}</TableCell>
                <TableCell className="text-right">
                  {txn.cafe.cafe_name}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
