import type { Fund, FundInput } from "@/api/fund"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState, type ReactNode } from "react"

export default function FundFormDialog({
  children,
  title,
  desc,
  fund,
  isOpen,
  setOpen,
  onSubmit,
}: {
  children?: ReactNode
  title: string
  desc: string
  remove?: boolean
  fund?: Fund
  isOpen?: boolean
  setOpen?: (bol: boolean) => void
  onSubmit: (input: FundInput) => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <FundForm data={fund} onSubmit={onSubmit}>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </FundForm>
      </DialogContent>
    </Dialog>
  )
}

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useCreateFund } from "@/hooks/use-fund"
import { zodResolver } from "@hookform/resolvers/zod"
import dayjs from "dayjs"
import { Plus } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

type Form = {
  children?: ReactNode
  data?: Fund
  onSubmit: (input: FundInput) => void
}

const formSchema = z.object({
  name: z.string().min(1, "Fund name is required"),
  expired: z.string().min(1, "Expired date is required"),
  start_use: z.string().min(1, "Start date is required"),
  amount: z.number().min(0, "Amount must be >= 0"),
  limit_spend: z.number().min(0, "Limit per day must be >= 0"),
  limit_per_tf: z.number().min(0, "Limit per transaction must be >= 0"),
})

type FundFormValues = z.infer<typeof formSchema>

export function FundForm({ children, data, onSubmit }: Form) {
  const form = useForm<FundFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: data
      ? {
          name: data.name,
          expired: dayjs(data.expired).format("YYYY-MM-DD"),
          start_use: dayjs(data.start_use).format("YYYY-MM-DD"),
          amount: data.amount,
          limit_spend: data.limit_spend,
          limit_per_tf: data.limit_per_tf,
        }
      : undefined,
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="fund-name">Fund Name</FieldLabel>
              <Input
                {...field}
                id="fund-name"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="amount"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="amount">Amount</FieldLabel>
              <Input
                {...field}
                id="amount"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                type="number"
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="start_use"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="start_use">Start</FieldLabel>
                <Input
                  type="date"
                  {...field}
                  id="start_use"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="expired"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="expired">Expired</FieldLabel>
                <Input
                  type="date"
                  {...field}
                  id="expired"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          name="limit_spend"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="limit_spend">Limit Per Day</FieldLabel>
              <Input
                {...field}
                id="limit_spend"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                type="number"
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="limit_per_tf"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="limit_per_tf">Limit Per Trans</FieldLabel>
              <Input
                {...field}
                id="limit_per_tf"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                type="number"
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      {/* {children} */}

      {children ?? (
        <>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
            <Button type="reset" variant="outline">
              Cancel
            </Button>
          </Field>
        </>
      )}
    </form>
  )
}

export function FundFormTriggerBtn() {
  const [open, setOpen] = useState(false)

  const create = useCreateFund()

  const onFormSubmit = (input: FundInput) => {
    create.mutate(input, {
      onSuccess: () => {
        setOpen(false)
      },
    })
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={() => setOpen(true)}>
            <Plus />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Create new fund</p>
        </TooltipContent>
      </Tooltip>
      <FundFormDialog
        title="Create new fund"
        desc="Fill all the form"
        isOpen={open}
        setOpen={setOpen}
        onSubmit={onFormSubmit}
      />
    </>
  )
}
