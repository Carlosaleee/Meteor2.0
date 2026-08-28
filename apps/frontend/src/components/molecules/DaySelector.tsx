"use client";

import { SelectorChip } from "@/components/atoms/SelectorChip";

const DAYS = ["D0", "D+1", "D+2"] as const;

type DaySelectorProps = {
  value: number;
  onChange: (index: number) => void;
};

export function DaySelector({ value, onChange }: DaySelectorProps) {
  return (
    <div className="flex gap-1">
      {DAYS.map((label, index) => (
        <SelectorChip
          key={label}
          label={label}
          selected={value === index}
          onSelect={() => onChange(index)}
        />
      ))}
    </div>
  );
}
