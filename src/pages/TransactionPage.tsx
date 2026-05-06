import type { TfParams } from "@/api/transaction"
import DataTable from "@/components/data-table"
import { DateRangeFilter } from "@/components/date-range-filter"
import { MetricCard } from "@/components/MetricCard"
import { SelectFunds } from "@/components/select-funds"
import { TableTooltipsBtn } from "@/components/table-tooltip-btn"
import { Button } from "@/components/ui/button"
import { useGetCafeTf } from "@/hooks/use-transaction"
import { formatDate, formatNumber, formatRM } from "@/lib/utils"
import dayjs from "dayjs"
import { jsPDF } from "jspdf"
import { autoTable } from "jspdf-autotable"
import {
  BadgeDollarSign,
  Printer,
  Receipt,
  Save,
  Search,
  X,
} from "lucide-react"
import { useRef, useState } from "react"
import { cafeTransactionCol } from "./cafe/columns"

export function TransactionPage() {
  const [tfPayload, setPayload] = useState<TfParams>({
    fundId: 0,
    from: "",
    to: "",
  })
  const { data, refetch } = useGetCafeTf(tfPayload)

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  // modal content ref (what to print)
  const printRef = useRef<HTMLDivElement>(null)

  const onFilter = (newFilter: Partial<TfParams>) => {
    setPayload((prev) => ({ ...prev, ...newFilter }))
  }

  const handleOpenPrintPreview = () => {
    setIsPrintModalOpen(true)
  }

  const printAndPdf = () => {
    if (!printRef.current) return

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
        trx.cafe_name,
        trx.premise,
        trx.owner_name,
        trx.no_tel,
        trx.account_no,
        trx.bank,
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
          content: `Dicetak pada ${dayjs().format("DD/MM/YYYY hh:mma")}`,
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
    <div className="space-y-4">
      {/* Summary */}
      {data && (
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Total Transaction"
            value={formatNumber(data.summary.totalTf)}
            icon={<Receipt className="h-4 w-4 text-muted-foreground" />}
          />
          <MetricCard
            title="Total Amount"
            value={formatRM(data.summary.totalAmount)}
            icon={<BadgeDollarSign className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
      )}
      {/* Main table + filter bar */}
      <DataTable
        columns={cafeTransactionCol}
        data={data?.transactions || []}
        colName="cafe_name"
        placeholder="Search for Company Name"
      >
        <div className="flex flex-wrap gap-2">
          <SelectFunds onValueChange={(e) => onFilter({ fundId: e })} />
          <DateRangeFilter onUpdate={(e) => onFilter(e)} />
          <TableTooltipsBtn tips="Find transaction">
            <Button onClick={() => refetch()}>
              <Search />
            </Button>
          </TableTooltipsBtn>
          <TableTooltipsBtn tips="Print transaction">
            <Button onClick={handleOpenPrintPreview}>
              <Printer />
            </Button>
          </TableTooltipsBtn>
        </div>
      </DataTable>

      {/* Semi‑transparent print modal */}
      {isPrintModalOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50"
          onClick={() => setIsPrintModalOpen(false)}
        >
          <div
            className="relative h-[90vh] w-[90vw] overflow-hidden rounded-lg bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button size="sm" onClick={printAndPdf} disabled={!data}>
                <Save />
                Download PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPrintModalOpen(false)}
              >
                <X />
                Close
              </Button>
            </div>

            {/* Light‑weight table (no Tailwind/shadcn colors) */}
            <div
              ref={printRef}
              id="print-table"
              className="h-full w-full overflow-auto p-4"
              style={{ background: "white" }}
            >
              <h1 className="mb-4 text-lg font-bold">Transaction Report</h1>
              <table className="w-full border-collapse border border-gray-300 text-xs">
                <thead>
                  <tr style={{ background: "rgb(243, 244, 246)" }}>
                    <th className="border border-gray-300 px-2 py-1">BIL</th>
                    <th className="border border-gray-300 px-2 py-1">
                      NAMA SYARIKAT
                    </th>
                    <th className="border border-gray-300 px-2 py-1">
                      ALAMAT PREMIS
                    </th>
                    <th className="border border-gray-300 px-2 py-1">
                      PEMILIK/PENGURUS
                    </th>
                    <th className="border border-gray-300 px-2 py-1">NO TEL</th>
                    <th className="border border-gray-300 px-2 py-1">
                      NO AKAUN
                    </th>
                    <th className="border border-gray-300 px-2 py-1">BANK</th>
                    <th className="border border-gray-300 px-2 py-1">
                      TRANSAKSI
                    </th>
                    <th className="border border-gray-300 px-2 py-1">
                      JUMLAH(RM)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.transactions.map((trx, idx) => (
                    <tr key={trx.id}>
                      <td className="border border-gray-300 px-2 py-1">
                        {idx + 1}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {trx.cafe_name}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {trx.premise}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {trx.owner_name}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {trx.no_tel}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {trx.account_no}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {trx.bank}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {trx.totalTransaction}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {trx.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="text-center font-bold">
                    <td
                      className="border border-gray-300 px-2 py-1"
                      colSpan={6}
                    ></td>
                    <td className="border border-gray-300 px-2 py-1">JUMLAH</td>
                    <td className="border border-gray-300 px-2 py-1">
                      {data?.summary.totalTf}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {data?.summary.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
