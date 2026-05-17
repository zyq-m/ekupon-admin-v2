import type { CafeTfRes, TfParams } from "@/api/transaction"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn, formatDate } from "@/lib/utils"
import dayjs from "dayjs"
import { jsPDF } from "jspdf"
import { autoTable } from "jspdf-autotable"
import { Printer } from "lucide-react"
import { Button } from "./ui/button"

type Props = {
  data?: CafeTfRes
  tfPayload: TfParams
}

export default function TransactionReportTable({ data, tfPayload }: Props) {
  const printAndPdf = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    // const pageHeight = doc.internal.pageSize.getHeight()

    // Image size and padding
    const imgWidth = 11
    const imgHeight = 15
    const rightPadding = 10

    // Top‑right position
    const x = pageWidth - imgWidth - rightPadding
    const y = 10

    // Add UNISZA logo (from public/)
    const imgPath = "/ekupon-admin/unisza.png"
    const img = new Image()
    img.onload = () => {
      doc.addImage(imgPath, "PNG", x, y, imgWidth, imgHeight)

      const text = {
        fund: data!.fund.name,
        from: formatDate(data!.date.from),
        to: formatDate(data!.date.to),
      }

      // Title text, centered
      const xOffset = pageWidth / 2
      doc.setFontSize(10)
      doc.text(
        `TUNTUTAN PEMBERIAN BANTUAN ${text.fund} (eKupon@UniSZA) PADA ${text.from} HINGGA ${text.to}`,
        xOffset,
        20,
        { align: "center" }
      )

      const rows = (data?.transactions || []).map((trx, idx) => [
        idx + 1,
        trx.cafe_name.toUpperCase(),
        trx.premise.toUpperCase(),
        trx.owner_name.toUpperCase(),
        trx.no_tel.toUpperCase(),
        trx.account_no.toUpperCase(),
        trx.bank.toUpperCase(),
        trx.totalTransaction,
        trx.totalAmount.toFixed(2),
      ])

      const columns = [
        "BIL",
        "NAMA SYARIKAT",
        "ALAMAT PREMIS",
        "PEMILIK/PENGURUS",
        "NO TEL",
        "NO AKAUN",
        "BANK",
        "TRANSAKSI",
        "JUMLAH(RM)",
      ]

      // Add the last row: 4 columns, where col 1 spans 6
      const summaryRow = [
        {
          content: `DICETAK PADA ${dayjs().format("DD/MM/YYYY hh:mmA")}`,
          colSpan: 6,
        },
        "JUMLAH", // 7th col
        data!.summary.totalTf,
        data!.summary.totalAmount.toFixed(2),
      ]

      autoTable(doc, {
        startY: 28, // below text and logo
        head: [columns],
        body: [...rows, summaryRow],
        theme: "grid",
        margin: { left: 10, right: 10, top: 10 },
        styles: {
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          fontSize: 9,
        },
        headStyles: {
          fillColor: [255, 255, 255],
          lineWidth: 0.1,
          halign: "center",
        },
        columnStyles: {
          0: { halign: "center" },
          4: { halign: "center" },
          5: { halign: "center" },
          6: { halign: "center" },
          7: { halign: "center" },
          8: { halign: "center" },
        },
        tableWidth: "auto",
      })

      doc.save(
        `Tuntutan Pemberian Bantuan ${text.fund} (eKupon@UniSZA) (${text.from} - ${text.to}).pdf`
      )
    }
    img.src = imgPath
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={cn(!data && "hidden")}>
          <Printer />
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-4/5">
        <DialogTitle>Transction reports</DialogTitle>
        <DialogDescription>
          Transaction of {data?.fund.name} from {formatDate(tfPayload.from)} to{" "}
          {formatDate(tfPayload.to)}
        </DialogDescription>
        <div className="max-h-[50vh] overflow-auto">
          <Table className="text-xs">
            <TableCaption className="pb-4">
              List of transactions details
            </TableCaption>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="border">BIL</TableHead>
                <TableHead className="border">NAMA SYARIKAT</TableHead>
                <TableHead className="border">ALAMAT PREMIS</TableHead>
                <TableHead className="border">PEMILIK/PENGURUS</TableHead>
                <TableHead className="border">NO TEL</TableHead>
                <TableHead className="border">NO AKAUN</TableHead>
                <TableHead className="border text-center">BANK</TableHead>
                <TableHead className="border text-center">TRANSAKSI</TableHead>
                <TableHead className="border text-center">JUMLAH(RM)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.transactions.map((trx, idx) => (
                <TableRow key={trx.id}>
                  <TableCell className="border px-2 py-1 text-center">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="border px-2 py-1">
                    {trx.cafe_name}
                  </TableCell>
                  <TableCell className="border px-2 py-1">
                    {trx.premise}
                  </TableCell>
                  <TableCell className="border px-2 py-1">
                    {trx.owner_name}
                  </TableCell>
                  <TableCell className="border px-2 py-1">
                    {trx.no_tel}
                  </TableCell>
                  <TableCell className="border px-2 py-1">
                    {trx.account_no}
                  </TableCell>
                  <TableCell className="border px-2 py-1 text-center">
                    {trx.bank}
                  </TableCell>
                  <TableCell className="border px-2 py-1 text-center">
                    {trx.totalTransaction}
                  </TableCell>
                  <TableCell className="border px-2 py-1 text-center">
                    {trx.totalAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {data?.summary && (
              <TableFooter>
                <TableRow className="text-center font-bold">
                  <TableCell className="border px-2 py-1" colSpan={6} />
                  <TableCell className="border px-2 py-1">JUMLAH</TableCell>
                  <TableCell className="border px-2 py-1">
                    {data.summary.totalTf}
                  </TableCell>
                  <TableCell className="border px-2 py-1">
                    {data.summary.totalAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={printAndPdf}>Download PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
