import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { useGetFunds } from "@/hooks/use-fund"
import { useEffect, useState } from "react"

export function SelectFunds({
  value: externalValue,
  onValueChange,
}: {
  value?: string | null
  onValueChange: (id: number) => void
}) {
  const { data } = useGetFunds()
  const [value, setValue] = useState<string | null>("")

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (externalValue !== undefined) setValue(externalValue)
  }, [externalValue])

  const handleSelect = (selectedName: string | null) => {
    // Find the ID corresponding to the selected name
    const selectedFund = data?.find((fund) => fund.name === selectedName)
    if (selectedFund) {
      setValue(selectedName)
      onValueChange(selectedFund.id) // Send ID to parent
    }
  }

  return (
    <Combobox value={value} onValueChange={handleSelect} items={data}>
      <ComboboxInput placeholder="Select a fund" />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(fund) => (
            <ComboboxItem key={fund.id} value={fund.name}>
              {fund.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
