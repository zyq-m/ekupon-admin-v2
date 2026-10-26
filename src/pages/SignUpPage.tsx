import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useSetPassword } from "@/hooks/use-auth"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Ticket,
  TriangleAlert,
} from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Link, useParams } from "react-router-dom"
import { z } from "zod"

const formSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    rePass: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.rePass, {
    message: "Passwords do not match",
    path: ["rePass"],
  })

type FormValues = z.infer<typeof formSchema>

function getErrorMessage(err: unknown) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ??
    "Unable to set your password. The invitation link may be invalid or expired."
  )
}

export function SignUpPage() {
  const { token } = useParams<{ token: string }>()
  const setPassword = useSetPassword()
  const [showPassword, setShowPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      rePass: "",
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    if (!token) return

    setSubmitError(null)
    setPassword.mutate(
      {
        token,
        password: values.password,
        rePass: values.rePass,
      },
      {
        onSuccess: () => setIsSuccess(true),
        onError: (err) => setSubmitError(getErrorMessage(err)),
      }
    )
  })

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            to="/ekupon-admin/login"
            className="flex items-center gap-2 font-medium"
          >
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Ticket className="size-4" />
            </div>
            eKupon@UniSZA
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            {isSuccess ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <CheckCircle2 className="size-12 text-green-600" />
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold">Password set</h1>
                  <p className="text-sm text-muted-foreground">
                    Your password has been created. You can now sign in to your
                    admin account.
                  </p>
                </div>
                <Button asChild className="w-full">
                  <Link to="/ekupon-admin/login">Go to login</Link>
                </Button>
              </div>
            ) : !token ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <TriangleAlert className="size-12 text-destructive" />
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold">Invalid invitation link</h1>
                  <p className="text-sm text-muted-foreground">
                    This invitation link is missing a token. Ask a super admin
                    to resend your invitation.
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/ekupon-admin/login">Back to login</Link>
                </Button>
              </div>
            ) : (
              <form className="flex flex-col gap-6" onSubmit={onSubmit}>
                <FieldGroup>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Set your password</h1>
                    <p className="text-sm text-muted-foreground">
                      Create a password for your eKupon@UniSZA admin account.
                    </p>
                  </div>

                  {submitError && (
                    <Alert variant="destructive">
                      <TriangleAlert />
                      <AlertTitle>Unable to set password</AlertTitle>
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  )}

                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
                            className="pr-9"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((visible) => !visible)}
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        </div>
                        <FieldDescription>
                          Use at least 8 characters.
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="rePass"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="rePass">
                          Confirm password
                        </FieldLabel>
                        <Input
                          id="rePass"
                          type={showPassword ? "text" : "password"}
                          placeholder="Re-enter your password"
                          autoComplete="new-password"
                          {...field}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Button type="submit" disabled={setPassword.isPending}>
                    {setPassword.isPending ? (
                      <>
                        <Loader2 className="animate-spin" /> Setting password…
                      </>
                    ) : (
                      "Set password"
                    )}
                  </Button>
                </FieldGroup>
              </form>
            )}
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="https://www.unisza.edu.my/wp-content/uploads/2022/02/tugu-1-1024x1024.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
