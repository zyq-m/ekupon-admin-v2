import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { useEffect, useState } from "react"

type ComboboxItemData = { id: number; name: string }

export function ComboboxSelect<T extends ComboboxItemData>({
  items,
  initialName,
  onSelect,
}: {
  items: T[] | undefined
  initialName?: string | null
  onSelect: (id: T["id"]) => void
}) {
  const [value, setValue] = useState<string | null>(initialName ?? null)

  // Use initialName if provided and data is available
  useEffect(() => {
    if (!initialName && items?.length && !value) {
      const first = items[0]!
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(first.name)
      onSelect(first.id)
    }
  }, [initialName, items, value, onSelect])

  const handleSelect = (selectedName: string | null) => {
    const found = items?.find((item) => item.name === selectedName)
    if (found) {
      setValue(selectedName)
      onSelect(found.id)
    }
  }

  if (!items || items.length === 0) return null

  return (
    <Combobox
      value={value}
      onValueChange={handleSelect}
      items={items}
      itemToStringValue={(item) => item.name}
    >
      <ComboboxInput placeholder="Select an option" />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.id} value={item.name}>
              {item.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
