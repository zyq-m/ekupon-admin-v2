import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="scroll-m-20 text-6xl font-bold tracking-tight lg:text-8xl">
        404
      </h1>
      <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Page not found
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Sorry, the page you’re looking for doesn’t exist or has been moved.
        Please check the URL and try again.
      </p>
      <Button>
        <Link to="/ekupon-admin/dashboard">Go back home</Link>
      </Button>
    </div>
  )
}
