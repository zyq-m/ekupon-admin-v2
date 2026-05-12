import type { StudentUploadComparison } from "@/api/student"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCallback, useState } from "react"

type FieldKey = "name" | "ic_no" | "matric_no"

const fields: { key: FieldKey; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "ic_no", label: "IC No." },
  { key: "matric_no", label: "Matric No." },
]

interface ConflictTableProps {
  data: StudentUploadComparison[]
  onResolve: (
    student: StudentUploadComparison,
    resolved: StudentUploadComparison["uploaded"]
  ) => void
  resolving?: boolean
}

export function ConflictTable({ data, onResolve, resolving }: ConflictTableProps) {
  const [drafts, setDrafts] = useState<
    Record<string, StudentUploadComparison["uploaded"]>
  >({})

  const getKey = (s: StudentUploadComparison) =>
    `${s.uploaded.ic_no}|${s.uploaded.matric_no}`

  const getDraft = useCallback(
    (student: StudentUploadComparison) => {
      const key = getKey(student)
      return (
        drafts[key] ?? {
          name: student.uploaded.name,
          ic_no: student.uploaded.ic_no,
          matric_no: student.uploaded.matric_no,
        }
      )
    },
    [drafts]
  )

  const setField = (
    student: StudentUploadComparison,
    field: FieldKey,
    value: string
  ) => {
    const key = getKey(student)
    setDrafts((prev) => ({
      ...prev,
      [key]: { ...getDraft(student), [field]: value },
    }))
  }

  return (
    <div className="space-y-4">
      {data.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No conflicts remaining.
        </p>
      )}
      {data.map((student) => {
        const key = getKey(student)
        const draft = getDraft(student)
        const existing = student.existing

        return (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {student.uploaded.name}
                <Badge variant="destructive">Conflict</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="w-28 px-3 py-2 text-left font-medium">
                        Field
                      </th>
                      <th className="w-1/3 px-3 py-2 text-left font-medium text-muted-foreground">
                        Existing (DB)
                      </th>
                      <th className="w-1/3 px-3 py-2 text-left font-medium text-muted-foreground">
                        Uploaded
                      </th>
                      <th className="px-3 py-2 text-left font-medium">
                        Resolved Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map(({ key: fieldKey, label }) => {
                      const uploadVal = student.uploaded[fieldKey]
                      const existVal = existing?.[fieldKey]
                      const hasDiff =
                        existVal !== undefined &&
                        existVal.toLowerCase().trim() !==
                          uploadVal.toLowerCase().trim()

                      return (
                        <tr key={fieldKey} className="border-b last:border-0">
                          <td className="px-3 py-2.5 font-medium">{label}</td>
                          <td className="px-3 py-2.5">
                            <ValueDisplay
                              value={existVal}
                              highlight={hasDiff ? "existing" : undefined}
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <ValueDisplay
                              value={uploadVal}
                              highlight={hasDiff ? "uploaded" : undefined}
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1">
                              <Input
                                value={draft[fieldKey]}
                                onChange={(e) =>
                                  setField(student, fieldKey, e.target.value)
                                }
                                className="h-8 text-sm"
                              />
                              {existVal !== undefined && (
                                <>
                                  <button
                                    type="button"
                                    className={cn(
                                      "inline-flex size-7 items-center justify-center rounded-md border text-xs transition-colors",
                                      draft[fieldKey] === existVal
                                        ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                                        : "border-border text-muted-foreground hover:bg-muted"
                                    )}
                                    title="Use existing value"
                                    onClick={() =>
                                      setField(student, fieldKey, existVal)
                                    }
                                  >
                                    <ChevronLeft className="size-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    className={cn(
                                      "inline-flex size-7 items-center justify-center rounded-md border text-xs transition-colors",
                                      draft[fieldKey] === uploadVal
                                        ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                                        : "border-border text-muted-foreground hover:bg-muted"
                                    )}
                                    title="Use uploaded value"
                                    onClick={() =>
                                      setField(student, fieldKey, uploadVal)
                                    }
                                  >
                                    <ChevronRight className="size-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button size="sm" disabled={resolving} onClick={() => onResolve(student, draft)}>
                Resolve
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

function ValueDisplay({
  value,
  highlight,
}: {
  value?: string
  highlight?: "existing" | "uploaded"
}) {
  if (value === undefined)
    return <span className="text-muted-foreground">—</span>
  return (
    <span
      className={cn(
        highlight === "existing" &&
          "text-destructive line-through decoration-destructive/50",
        highlight === "uploaded" && "text-destructive"
      )}
    >
      {value}
    </span>
  )
}
