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
import { useUpdateCouponBalance } from "@/hooks/use-student"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ReactNode } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

// ========== Form schema ==========
const formSchema = z.object({
  balance: z.number().min(0, "Amount must be >= 0"),
})

type FormValues = z.infer<typeof formSchema>

// ========== Props ==========
type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentName: string
  // Assume `coupon` here is a student coupon with `id` and `balance`
  coupon: {
    id: number
    balance: number
  }
  // optional callback after success
  onSubmit?: (updated: { couponId: number; balance: number }) => void
  children?: ReactNode
}

export function CouponAmountDialog({
  open,
  onOpenChange,
  studentName,
  coupon,
  onSubmit,
  children,
}: Props) {
  const update = useUpdateCouponBalance()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      balance: coupon.balance,
    },
  })

  const { handleSubmit } = form

  const submit = handleSubmit(async (values) => {
    update.mutate(
      {
        id: coupon.id,
        balance: values.balance,
      },
      {
        onSuccess: () => {
          onSubmit?.({ couponId: coupon.id, balance: values.balance })
          onOpenChange(false)
        },
      }
    )
  })

  const isPending = update.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Coupon Amount</DialogTitle>
          <DialogDescription>
            Student: <strong>{studentName}</strong>
            <br />
            Current balance: RM {coupon.balance.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <FieldGroup>
            <Controller
              name="balance"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="balance">New balance (RM)</FieldLabel>
                  <Input
                    id="balance"
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
              disabled={isPending}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
