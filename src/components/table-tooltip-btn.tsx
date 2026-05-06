import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ReactNode } from "react"

export function TableTooltipsBtn({
  children,
  tips,
}: {
  children: ReactNode
  tips: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>
        <p>{tips}</p>
      </TooltipContent>
    </Tooltip>
  )
}
