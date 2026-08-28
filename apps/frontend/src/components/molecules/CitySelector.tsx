"use client";

import { SelectorChip } from "@/components/atoms/SelectorChip";
import type { Location } from "@/lib/schemas";

type CitySelectorProps = {
  locations: Location[];
  value: string;
  onChange: (id: string) => void;
};

export function CitySelector({ locations, value, onChange }: CitySelectorProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {locations.map((location) => (
        <SelectorChip
          key={location.id}
          label={location.name}
          selected={location.id === value}
          onSelect={() => onChange(location.id)}
        />
      ))}
    </div>
  );
}
