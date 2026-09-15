import DataTable from "@/components/data-table"
import { CafeFormDialog } from "@/components/form/cafe-form"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSuspendUser } from "@/hooks/use-auth"
import { useGetCafe, useCreateCafe, useUpdateCafe } from "@/hooks/use-cafe"
import { formatDate } from "@/lib/utils"
import { Download, Plus, QrCode } from "lucide-react"
import JSZip from "jszip"
import QRCode from "qrcode"
import { useState } from "react"
import * as XLSX from "xlsx"
import { columns } from "./columns"

export function CafeListPage() {
  const { data } = useGetCafe()
  const suspend = useSuspendUser()
  const update = useUpdateCafe()
  const create = useCreateCafe()

  const [open, setOpen] = useState(false)

  const activeCafes = data?.filter((cafe) => cafe.user.is_active)

  const downloadExcel = () => {
    const rows =
      data?.map((cafe) => ({
        "Cafe Name": cafe.cafe_name,
        Owner: cafe.owner_name,
        "No. Tel": cafe.no_tel ?? "",
        Bank: cafe.bank.name,
        "Account No.": cafe.account_no,
        Status: cafe.user.is_active ? "Active" : "Suspended",
        Premise: cafe.premise ?? "",
        "Register No.": cafe.registerNo ?? "",
        Start: cafe.start ? formatDate(cafe.start) : "",
        End: cafe.end ? formatDate(cafe.end) : "",
        "Total Earned": cafe.total_earn,
      })) ?? []

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, "Cafes")
    XLSX.writeFile(wb, "cafes.xlsx")
  }

  const downloadQr = async () => {
    if (!activeCafes?.length) return

    const zip = new JSZip()
    const folder = zip.folder("cafe-qr") ?? zip

    for (const cafe of activeCafes) {
      const dataUrl = await QRCode.toDataURL(`${import.meta.env.VITE_API_URL}/?id=${cafe.id}`, {
        width: 512,
        margin: 2,
      })
      const base64 = dataUrl.split(",")[1]
      folder.file(
        `${cafe.cafe_name.replace(/[\\/:*?"<>|]+/g, "_")}.png`,
        base64,
        { base64: true }
      )
    }

    const blob = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "cafe-qr.zip"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <DataTable
        columns={columns({ suspend, update })}
        data={data ?? []}
        colName="cafe_name"
        placeholder="Search for Cafe Name"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => setOpen(true)}>
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add new cafe</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={downloadExcel} disabled={!data?.length}>
              <Download />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download Excel</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={downloadQr} disabled={!activeCafes?.length}>
              <QrCode />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download QR (active cafes)</p>
          </TooltipContent>
        </Tooltip>

        <CafeFormDialog
          onSubmit={(input) =>
            create.mutate(input, { onSuccess: () => setOpen(false) })
          }
          title="Create new cafe"
          desc="Fill in the cafe details below"
          isOpen={open}
          setOpen={setOpen}
        />
      </DataTable>
    </div>
  )
}
