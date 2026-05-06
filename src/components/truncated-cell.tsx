import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

export function TruncatedCell({ cell }: { cell: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* 1. CSS truncation to show ellipsis when too long */}
          <div className="max-w-50 cursor-help truncate">{cell}</div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {/* 2. Full text in tooltip for readability */}
          {cell}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
