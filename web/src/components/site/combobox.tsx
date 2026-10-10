"use client";

import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/** Names that start with the search first, then names that contain it; no fuzzy matches ("kir" is Kirehe, not Karongi). */
function matchScore(value: string, search: string, keywords: string[] = []): number {
  const q = search.trim().toLowerCase();
  const words = [value, ...keywords].map((w) => w.toLowerCase());
  if (words.some((w) => w.startsWith(q))) return 1;
  return words.some((w) => w.includes(q)) ? 0.5 : 0;
}

export type ComboboxGroup = { label: string; options: { value: string; label: string; keywords?: string[] }[] };

type Props = {
  id: string;
  value: string;
  groups: ComboboxGroup[];
  onChange: (value: string) => void;
  searchLabel: string;
  emptyLabel: string;
};

/** Searchable single choice, labelled by the surrounding Field (its Label points at the trigger's id). */
export function Combobox({ id, value, groups, onChange, searchLabel, emptyLabel }: Props) {
  const [open, setOpen] = useState(false);
  const current = groups.flatMap((g) => g.options).find((o) => o.value === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-describedby={`${id}-help`}
          className="w-full justify-between bg-card font-normal hover:bg-card aria-expanded:bg-card"
        >
          {current?.label}
          <ChevronsUpDown aria-hidden className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
        <Command filter={matchScore} defaultValue={value}>
          <CommandInput placeholder={searchLabel} aria-label={searchLabel} />
          <CommandList>
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            {groups.map((g) => (
              <CommandGroup key={g.label} heading={g.label}>
                {g.options.map((o) => (
                  <CommandItem
                    key={o.value}
                    value={o.value}
                    keywords={[o.label, ...(o.keywords ?? [])]}
                    data-checked={o.value === value}
                    onSelect={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                  >
                    {o.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
