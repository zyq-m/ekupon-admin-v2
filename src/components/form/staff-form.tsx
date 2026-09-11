import type {
  InputStaff,
  StaffUploadComparison,
  TStaff,
} from "@/api/staff"
import DataTable from "@/components/data-table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSuspendUser } from "@/hooks/use-auth"
import { useDebounce } from "@/hooks/use-debounce"
import { useGetPtj, useStaffSearch } from "@/hooks/use-staff"
import { staffCol } from "@/pages/staff/columns"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required"),
  no_staff: z.string().min(1, "No Staff is required"),
})

type FormData = z.infer<typeof formSchema>

interface ConflictDialogProps {
  staff: StaffUploadComparison
  onSave: (updated: FormData) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function StaffConflictDialog({
  staff,
  onSave,
  isOpen,
  setIsOpen,
}: ConflictDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      no_staff: "",
    },
  })

  useEffect(() => {
    if (isOpen && staff.uploaded) {
      form.reset({
        name: staff.uploaded.name,
        email: staff.uploaded.email,
        no_staff: staff.uploaded.no_staff,
      })
    }
  }, [isOpen, staff.uploaded, form])

  function onSubmit(data: FormData) {
    onSave(data)
    setIsOpen(false)
  }

  const isMismatch = (dbValue: string, inputValue: string) =>
    dbValue && dbValue.trim().toLowerCase() !== inputValue.trim().toLowerCase()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Staff</DialogTitle>
          <DialogDescription>Fix data mismatches below.</DialogDescription>
        </DialogHeader>

        <form id="staff-edit-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="staff-edit-form-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="staff-edit-form-name"
                    placeholder="HAZIQ MUSA"
                    aria-invalid={fieldState.invalid}
                  />
                  {staff.existing?.name &&
                    isMismatch(staff.existing.name, field.value || "") && (
                      <FieldError
                        errors={[{ message: staff.existing.name }]}
                      />
                    )}
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="staff-edit-form-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="staff-edit-form-email"
                    placeholder="haziq@unisza.edu.my"
                    aria-invalid={fieldState.invalid}
                  />
                  {staff.existing?.email &&
                    isMismatch(staff.existing.email, field.value || "") && (
                      <FieldError
                        errors={[{ message: staff.existing.email }]}
                      />
                    )}
                  {fieldState.invalid && !staff.existing && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="no_staff"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="staff-edit-form-no_staff">
                    No Staff
                  </FieldLabel>
                  <Input
                    {...field}
                    id="staff-edit-form-no_staff"
                    placeholder="S0001"
                    aria-invalid={fieldState.invalid}
                  />
                  {staff.existing?.no_staff &&
                    isMismatch(staff.existing.no_staff, field.value || "") && (
                      <FieldError
                        errors={[{ message: staff.existing.no_staff }]}
                      />
                    )}
                  {fieldState.invalid && !staff.existing && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          {staff.exists && staff.existing && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Existing Record</AlertTitle>
              <AlertDescription className="text-xs">
                <strong>{staff.existing.name}</strong>
                <br />
                Email: {staff.existing.email} | No Staff:{" "}
                {staff.existing.no_staff}
              </AlertDescription>
            </Alert>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" form="staff-edit-form">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function EditStaffForm({
  staff,
  onSave,
}: {
  staff: TStaff
  onSave: (data: InputStaff) => void
}) {
  const { data: ptjList } = useGetPtj()
  const [name, setName] = useState(staff.name)
  const [email, setEmail] = useState(staff.email)
  const [noStaff, setNoStaff] = useState(staff.no_staff)
  const [ptjId, setPtjId] = useState(
    ptjList?.find((p) => p.ptj === staff.ptj?.ptj)?.id ?? undefined
  )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave({
          name,
          email,
          no_staff: noStaff,
          ptj_id: ptjId,
          userId: staff.user_id,
        })
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="edit-staff-name">Name</FieldLabel>
          <Input
            id="edit-staff-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="edit-staff-email">Email</FieldLabel>
          <Input
            id="edit-staff-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="edit-staff-no_staff">No Staff</FieldLabel>
          <Input
            id="edit-staff-no_staff"
            value={noStaff}
            onChange={(e) => setNoStaff(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="edit-staff-ptj">PTJ</FieldLabel>
          <Select
            value={ptjId?.toString() ?? undefined}
            onValueChange={(v) => setPtjId(Number(v))}
          >
            <SelectTrigger id="edit-staff-ptj" className="w-full">
              <SelectValue placeholder="Select a PTJ" />
            </SelectTrigger>
            <SelectContent>
              {ptjList?.map((ptj) => (
                <SelectItem key={ptj.id} value={ptj.id.toString()}>
                  {ptj.ptj}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
      <DialogFooter className="mt-4">
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  )
}

export function StaffSearchForm() {
  const form = useForm<{
    searchTerm: string
    searchBy: "name" | "email" | "no_staff"
  }>({
    defaultValues: {
      searchTerm: "",
      searchBy: "name",
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const searchTerm = useDebounce(form.watch("searchTerm"), 500)
  const searchBy = useDebounce(form.watch("searchBy"), 300)

  const search = useStaffSearch({
    searchBy,
    searchTerm,
  })
  const suspend = useSuspendUser()

  const handleSubmit = form.handleSubmit(() => {
    search.refetch()
  })

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 bg-background pb-2">
        <form
          id="staff-search"
          onSubmit={handleSubmit}
        >
          <FieldGroup>
            <Controller
              name="searchTerm"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <InputGroup>
                    <InputGroupAddon>
                      <Search />
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      id="staff-search-term"
                      placeholder="Name, Email, No Staff"
                    />
                    <InputGroupAddon align="inline-end">
                      <Controller
                        name="searchBy"
                        control={form.control}
                        render={({ field: selectField }) => (
                          <Select
                            onValueChange={selectField.onChange}
                            value={selectField.value}
                          >
                            <InputGroupButton asChild>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </InputGroupButton>
                            <SelectContent align="end">
                              <SelectItem value="name">Name</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="no_staff">
                                No Staff
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </div>
      <DataTable columns={staffCol({ suspend })} data={search.data || []} />
    </div>
  )
}