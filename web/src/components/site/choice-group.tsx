"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Props<T extends string> = {
  id: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
};

/** Single-choice segmented control, labelled by the surrounding Field. */
export function ChoiceGroup<T extends string>({ id, value, options, onChange }: Props<T>) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      aria-labelledby={`${id}-label`}
      aria-describedby={`${id}-help`}
      value={value}
      onValueChange={(v) => v && onChange(v as T)}
      className="flex w-full flex-wrap"
    >
      {options.map((o) => (
        <ToggleGroupItem key={o.value} value={o.value} className="h-auto min-h-9 flex-1 py-1.5 whitespace-normal data-[state=on]:bg-primary">
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
