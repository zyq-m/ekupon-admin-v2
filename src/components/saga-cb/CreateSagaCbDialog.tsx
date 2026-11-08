import type { TfParams } from "@/api/transaction"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useGenerateSagaCb } from "@/hooks/use-saga-cb"
import { formatDate } from "@/lib/utils"
import { useState } from "react"
import { Input } from "../ui/input"

type Props = TfParams & {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerated?: (batchId: number) => void
  fundName: string
}

export function CreateSagaCbDialog({
  open,
  onOpenChange,
  onGenerated,
  fundId,
  from,
  to,
  fundName,
}: Props) {
  const generate = useGenerateSagaCb()
  const [email, setEmail] = useState("")

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
  }

  const canSubmit = fundId !== null && !!from && !!to && !generate.isPending

  const onGenerate = () => {
    if (fundId === null || !from || !to) return

    generate.mutate(
      { fundId, from: from, to: to, pic: email },
      {
        onSuccess: (res) => {
          onGenerated?.(res.batch.id)
          handleOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create CB payment</DialogTitle>
          <DialogDescription>
            Generate a SAGA Cash Book batch from the cafe transactions in the
            selected period.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Fund</Label>
            <p className="text-xs text-muted-foreground">{fundName}</p>
          </div>

          <div className="space-y-2">
            <Label>Transaction period</Label>
            {from && to && (
              <p className="text-xs text-muted-foreground">
                {formatDate(from)} - {formatDate(to)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pic">
              PIC Email <span className="text-xs text-red-500">*</span>
            </Label>
            <Input
              id="pic"
              placeholder="pic@email.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            This creates a batch and a local payment file. Nothing is sent to
            SAGA until the batch is uploaded.
          </p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={generate.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={onGenerate} disabled={!canSubmit}>
            {generate.isPending ? "Generating..." : "Generate batch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
