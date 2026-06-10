import type { Cafe, CreateCafeInput } from "@/api/cafe"
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
  onSubmit: (cafe: CreateCafeInput) => void
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
        <div className="-mx-4 max-h-[50vh] overflow-y-auto px-4">
          <CafeForm data={cafe} onSubmit={onSubmit}></CafeForm>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="cafe-form">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ========== Zod schema ==========

const cafeFormSchema = z.object({
  cafeId: z.string().min(1, "Cafe ID is required"),
  cafe_name: z.string().min(1, "Cafe name is required"),
  owner_name: z.string().min(1, "Owner name is required"),
  account_no: z.string().min(1, "Account number is required"),
  no_tel: z.string().min(1, "Phone number is required"),
  bank: z.string().min(1, "Bank is required"),
  premise: z.string(),
  registerNo: z.string(),
  start: z.string().min(1, "Start date is required"),
  end: z.string().min(1, "End date is required"),
})

type CafeFormValues = z.infer<typeof cafeFormSchema>

// ========== Standalone CafeForm ==========

type FormProps = {
  data?: Cafe
  onSubmit: (cafe: CreateCafeInput) => void
}

export function CafeForm({ data, onSubmit }: FormProps) {
  const form = useForm<CafeFormValues>({
    resolver: zodResolver(cafeFormSchema),
    defaultValues: data
      ? {
          cafeId: data.id,
          cafe_name: data.cafe_name,
          owner_name: data.owner_name,
          account_no: data.account_no,
          no_tel: data.no_tel ?? "",
          bank: data.bank,
          premise: data.premise ?? "",
          registerNo: data.registerNo ?? "",
          start: data.start
            ? new Date(data.start).toISOString().split("T")[0]
            : "",
          end: data.end ? new Date(data.end).toISOString().split("T")[0] : "",
        }
      : undefined,
  })

  return (
    <form
      id="cafe-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <FieldGroup>
        {!data && (
          <Controller
            name="cafeId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="cafeId">Cafe ID</FieldLabel>
                <Input
                  {...field}
                  id="cafeId"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  placeholder="ramlah50"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )}
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
              <FieldLabel htmlFor="registerNo">Register No</FieldLabel>
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
    </form>
  )
}
