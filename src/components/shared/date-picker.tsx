"use client";

import { format, isValid, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  /** Value as YYYY-MM-DD (empty = unset). */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Disable days before this YYYY-MM-DD. */
  min?: string;
  /** Disable days after this YYYY-MM-DD. */
  max?: string;
}

// Shadcn-style single date picker (Popover + Calendar) returning a
// YYYY-MM-DD string. Replaces the native <input type="date">.
export function DatePicker({ value, onChange, placeholder = "เลือกวันที่", min, max }: Props) {
  const date = value ? parseISO(value) : undefined;
  const selected = date && isValid(date) ? date : undefined;

  const minDate = min ? parseISO(min) : undefined;
  const maxDate = max ? parseISO(max) : undefined;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className="h-9 w-[160px] justify-start rounded-xl text-left text-sm font-normal"
          />
        }
      >
        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
        {selected ? (
          format(selected, "d MMM yyyy", { locale: th })
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => {
            if (d) onChange(format(d, "yyyy-MM-dd"));
          }}
          disabled={
            minDate || maxDate
              ? (day: Date) =>
                  (minDate ? day < minDate : false) ||
                  (maxDate ? day > maxDate : false)
              : undefined
          }
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
