// src/components/AddStudentDialog.tsx
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export function AddStudentDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>+ Add Student</Button>
      </DialogTrigger>
      <DialogContent>
        {/* Your Shadcn Form goes here */}
        <h2>Register New Student</h2>
        {/* Form fields: Name, Matric, IC, etc. */}
      </DialogContent>
    </Dialog>
  )
}
