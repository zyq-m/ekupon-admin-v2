import type { Cafe, UpdateCafeInput } from "@/api/cafe"
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, type ReactNode } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Textarea } from "../ui/textarea"

// ========== CafeFormDialog (reusable overlay) ==========

export function CafeFormDialog({
  children,
  title,
  desc,
  onSubmit,
  cafe,
  isOpen,
  setOpen,
}: {
  children?: ReactNode
  title: string
  desc: string
  cafe?: Cafe
  isOpen?: boolean
  setOpen?: (b: boolean) => void
  onSubmit: (cafe: UpdateCafeInput) => void
}) {
  const [localOpen, setLocalOpen] = useState(false)
  const finalOpen = isOpen ?? localOpen
  const finalSetOpen = setOpen ?? setLocalOpen

  return (
    <Dialog open={finalOpen} onOpenChange={finalSetOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <CafeForm data={cafe} onSubmit={onSubmit}>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </CafeForm>
      </DialogContent>
    </Dialog>
  )
}

// ========== Zod schema ==========

const cafeFormSchema = z.object({
  cafe_name: z.string().min(1, "Cafe name is required"),
  owner_name: z.string().min(1, "Owner name is required"),
  account_no: z.string().min(1, "Account number is required"),
  no_tel: z.string().optional(),
  bank: z.string().min(1, "Bank is required"),
  premise: z.string().optional(),
  registerNo: z.string().optional(),
  start: z.string().optional(), // leave as string for <input type="date">
  end: z.string().optional(),
})

type CafeFormValues = z.infer<typeof cafeFormSchema>

// ========== Standalone CafeForm ==========

type FormProps = {
  children?: ReactNode
  data?: Cafe
  onSubmit: (cafe: UpdateCafeInput) => void
}

export function CafeForm({ children, data, onSubmit }: FormProps) {
  const form = useForm<CafeFormValues>({
    resolver: zodResolver(cafeFormSchema),
    defaultValues: data
      ? {
          cafe_name: data.cafe_name,
          owner_name: data.owner_name,
          account_no: data.account_no,
          no_tel: data.no_tel ?? undefined,
          bank: data.bank,
          premise: data.premise ?? undefined,
          registerNo: data.registerNo ?? undefined,
          start: data.start
            ? new Date(data.start).toISOString().split("T")[0]
            : undefined,
          end: data.end
            ? new Date(data.end).toISOString().split("T")[0]
            : undefined,
        }
      : undefined,
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Controller
          name="cafe_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="cafe_name">Cafe Name</FieldLabel>
              <Input
                {...field}
                id="cafe_name"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="owner_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="owner_name">Owner Name</FieldLabel>
              <Input
                {...field}
                id="owner_name"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="no_tel"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="no_tel">Phone</FieldLabel>
              <Input
                {...field}
                id="no_tel"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                type="tel"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="bank"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="bank">Bank</FieldLabel>
              <Input
                {...field}
                id="bank"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder="CIMB"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="account_no"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="account_no">Account No</FieldLabel>
              <Input
                {...field}
                id="account_no"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="premise"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="premise">Premise</FieldLabel>
              <Textarea
                {...field}
                id="premise"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="registerNo"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="registerNo">
                Register No (optional)
              </FieldLabel>
              <Input
                {...field}
                id="registerNo"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="start"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="start">Valid From</FieldLabel>
                <Input
                  type="date"
                  {...field}
                  id="start"
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
            name="end"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="end">Valid Until</FieldLabel>
                <Input
                  type="date"
                  {...field}
                  id="end"
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
      </FieldGroup>

      {children ?? (
        <Field orientation="horizontal">
          <>
            <Button type="submit">Submit</Button>
            <Button type="reset" variant="outline">
              Cancel
            </Button>
          </>
        </Field>
      )}
    </form>
  )
}
