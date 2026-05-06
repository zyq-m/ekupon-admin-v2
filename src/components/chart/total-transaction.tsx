import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGetTotalTrans } from "@/hooks/use-dashboard"
import dayjs from "dayjs"
import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

const chartConfig = {
  count: {
    label: "Transaction",
    color: "#fff085", // very light yellow (yellow‑100)
  },
  total_amount: {
    label: "Amount",
    color: "#fbbf24", // accent yellow (yellow‑500)
  },
} satisfies ChartConfig

export function TotalTransaction() {
  const [timeRange, setTimeRange] = useState("6")
  const { data } = useGetTotalTrans(timeRange)

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Total Transactions</CardTitle>
          <CardDescription>Showing for the last 6 months</CardDescription>
        </div>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-40 rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="6" className="rounded-lg">
              Last 6 months
            </SelectItem>
            <SelectItem value="3" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="1" className="rounded-lg">
              Last 30 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-62.5 w-full"
        >
          <AreaChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(v) => dayjs(v).format("DD MMM")}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />

            <Area
              dataKey="count"
              type="natural"
              fill="var(--color-count)"
              fillOpacity={0.4}
              stroke="var(--color-count)"
              strokeWidth={2}
              dot={false}
            />
            <Area
              dataKey="total_amount"
              type="natural"
              fill="var(--color-total_amount)"
              fillOpacity={0.4}
              stroke="var(--color-total_amount)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
