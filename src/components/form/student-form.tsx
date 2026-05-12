import type { StudentUploadComparison, TStudent } from "@/api/student"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Search } from "lucide-react"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  ic_no: z.string().min(1, "IC No is required"),
  matric_no: z.string().min(1, "Matric No is required"),
  name: z.string().min(1, "Name is required"),
})

type FormData = z.infer<typeof formSchema>

interface Props {
  student: StudentUploadComparison
  onSave: (updatedStudent: FormData) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function StudentConflictDialog({
  student,
  onSave,
  isOpen,
  setIsOpen,
}: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ic_no: "",
      matric_no: "",
      name: "",
    },
  })

  useEffect(() => {
    if (isOpen && student.uploaded) {
      form.reset(student.uploaded)
    }
  }, [isOpen, student.uploaded, form])

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
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>Fix data mismatches below.</DialogDescription>
        </DialogHeader>

        <form id="student-edit-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Name */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="student-edit-form-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="student-edit-form-name"
                    placeholder="John Doe"
                    aria-invalid={fieldState.invalid}
                  />
                  {student.existing?.name &&
                    isMismatch(student.existing.name, field.value || "") && (
                      <FieldError
                        errors={[{ message: student.existing.name }]}
                      />
                    )}
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* IC No */}
            <Controller
              name="ic_no"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="student-edit-form-ic_no">
                    IC No
                  </FieldLabel>
                  <Input
                    {...field}
                    id="student-edit-form-ic_no"
                    placeholder="061112140710"
                    aria-invalid={fieldState.invalid}
                  />
                  {student.existing?.ic_no &&
                    isMismatch(student.existing.ic_no, field.value || "") && (
                      <FieldError
                        errors={[{ message: student.existing.ic_no }]}
                      />
                    )}
                  {fieldState.invalid && !student.existing && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Matric No */}
            <Controller
              name="matric_no"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="student-edit-form-matric_no">
                    Matric No
                  </FieldLabel>
                  <Input
                    {...field}
                    id="student-edit-form-matric_no"
                    placeholder="086348"
                    aria-invalid={fieldState.invalid}
                  />
                  {student.existing?.matric_no &&
                    isMismatch(
                      student.existing.matric_no,
                      field.value || ""
                    ) && (
                      <FieldError
                        errors={[{ message: student.existing.matric_no }]}
                      />
                    )}
                  {fieldState.invalid && !student.existing && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          {/* Existing Data Alert */}
          {student.exists && student.existing && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Existing Record</AlertTitle>
              <AlertDescription className="text-xs">
                <strong>{student.existing.name}</strong>
                <br />
                IC: {student.existing.ic_no} | Matric:{" "}
                {student.existing.matric_no}
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
          <Button type="submit" form="student-edit-form">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSuspendUser } from "@/hooks/use-auth"
import { useDebounce } from "@/hooks/use-debounce"
import { useStudentSearch } from "@/hooks/use-student"
import { columnSimple } from "@/pages/student/columns"
import { CircleQuestionMark } from "lucide-react"
import DataTable from "../data-table"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group"
import { Separator } from "../ui/separator"

export function StudentSearchDialog({
  onSearch,
}: {
  onSearch: (results: TStudent[]) => void
}) {
  const form = useForm<{
    searchTerm: string
    searchBy: "name" | "matric_no" | "ic_no"
  }>({
    defaultValues: {
      searchTerm: "",
      searchBy: "name",
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const searchTerm = useDebounce(form.watch("searchTerm"), 500)
  const searchBy = useDebounce(form.watch("searchBy"), 300)

  const search = useStudentSearch({
    searchBy,
    searchTerm,
  })
  const suspend = useSuspendUser()

  // ✅ Fixed: form.handleSubmit()
  const handleSubmit = form.handleSubmit(() => {
    search.refetch()
    onSearch(search.data || [])
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon-lg"
          className="fixed right-6 bottom-6 z-40 border-2 shadow-lg hover:shadow-xl"
        >
          <CircleQuestionMark className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="md:max-w-1/2"
        onCloseAutoFocus={() => form.reset()}
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>Search Students</DialogTitle>
        </DialogHeader>
        <Separator />
        {/* Search form */}
        <form
          id="student-search"
          onSubmit={handleSubmit} // Fixed!
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
                      id="student-search-term"
                      placeholder="Search for student"
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
                              <SelectItem value="matric_no">
                                Matric No.
                              </SelectItem>
                              <SelectItem value="ic_no">IC No.</SelectItem>
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
        <div className="no-scrollbar max-h-[50vh] overflow-y-auto">
          <DataTable
            columns={columnSimple({ suspend })}
            data={search.data || []}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
