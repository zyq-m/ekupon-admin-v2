import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useUpdateBalanceMany } from "@/hooks/use-fund"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ReactNode } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  amount: z.number().min(0, "Amount must be >= 0"),
})

type FormValues = z.infer<typeof formSchema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  coupons: { id: number }[]
  studentCount: number
  onSuccess?: () => void
  children?: ReactNode
}

export function BulkCouponAmountDialog({
  open,
  onOpenChange,
  coupons,
  studentCount,
  onSuccess,
  children,
}: Props) {
  const update = useUpdateBalanceMany()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
    },
  })

  const { handleSubmit, reset } = form

  const submit = handleSubmit((values) => {
    update.mutate(
      {
        amount: values.amount,
        coupon_ids: coupons.map((c) => c.id),
      },
      {
        onSuccess: () => {
          onSuccess?.()
          onOpenChange(false)
          reset()
        },
      }
    )
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Coupon Amounts</DialogTitle>
          <DialogDescription>
            Set a new balance for <strong>{studentCount}</strong> selected
            coupon(s).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <FieldGroup>
            <Controller
              name="amount"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="amount">New balance (RM)</FieldLabel>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value))
                    }
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={update.isPending}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
