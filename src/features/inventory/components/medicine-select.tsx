"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMedicines } from "@/features/medicines/hooks";

interface Props {
  value: string;
  onChange: (medicineId: string) => void;
  placeholder?: string;
}

// Shared selector of active medicines for stock movement forms.
export function MedicineSelect({ value, onChange, placeholder }: Props) {
  const { data } = useMedicines({ pageSize: 100 });
  const medicines = (data?.medicines ?? []).filter((m) => m.is_active);

  return (
    <Select value={value} onValueChange={(v) => onChange((v as string | null) ?? "")}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder ?? "เลือกยา"} />
      </SelectTrigger>
      <SelectContent>
        {medicines.map((m) => (
          <SelectItem key={m.id} value={m.id}>
            {m.code} — {m.name} (คงเหลือ {m.stock_on_hand} {m.unit})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
