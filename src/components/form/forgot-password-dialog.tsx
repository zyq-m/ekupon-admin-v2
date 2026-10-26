import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForgotPassword } from "@/hooks/use-auth"
import { Loader2, MailCheck } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

function getErrorMessage(err: unknown) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? "Failed to send reset link"
  )
}

export function ForgotPasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const forgotPassword = useForgotPassword()

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) {
      setEmail("")
      setSent(false)
      forgotPassword.reset()
    }
  }

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      toast.error("Email is required")
      return
    }

    forgotPassword.mutate(
      { email: trimmedEmail },
      {
        onSuccess: () => setSent(true),
        onError: (err) => toast.error(getErrorMessage(err)),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={false}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        {sent ? (
          <>
            <DialogHeader>
              <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MailCheck className="size-5" />
              </div>
              <DialogTitle>Check your email</DialogTitle>
              <DialogDescription>
                If an account exists for {email}, a reset link has been sent.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Forgot password</DialogTitle>
              <DialogDescription>
                Enter your admin email and we&apos;ll send you a link to reset
                your password.
              </DialogDescription>
            </DialogHeader>

            <form id="forgot-password-form" onSubmit={onSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
                  <Input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@unisza.edu.my"
                    autoComplete="email"
                    autoFocus
                  />
                </Field>
              </FieldGroup>
            </form>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="forgot-password-form"
                disabled={forgotPassword.isPending}
              >
                {forgotPassword.isPending ? (
                  <>
                    <Loader2 className="animate-spin" /> Sending…
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
