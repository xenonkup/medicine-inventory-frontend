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

export function MedicineSelect({ value, onChange, placeholder }: Props) {
  const { data } = useMedicines({ pageSize: 100 });
  const medicines = (data?.medicines ?? []).filter((m) => m.is_active);

  const label = (m: (typeof medicines)[number]) =>
    `${m.code} — ${m.name} (คงเหลือ ${m.stock_on_hand} ${m.unit})`;
  const items = Object.fromEntries(medicines.map((m) => [m.id, label(m)]));

  return (
    <Select
      items={items}
      value={value}
      onValueChange={(v) => onChange((v as string | null) ?? "")}
    >
      <SelectTrigger className="h-11 w-full rounded-xl bg-muted/50 transition-colors data-[popup-open]:bg-background">
        <SelectValue placeholder={placeholder ?? "เลือกยา"} />
      </SelectTrigger>
      <SelectContent>
        {medicines.map((m) => (
          <SelectItem key={m.id} value={m.id}>
            {label(m)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
