import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FieldProps = { id: string; label: string; help: string; error?: string; children: ReactNode };

/** Label, then a helper line that turns into the error, then the control (no placeholders). */
export function Field({ id, label, help, error, children }: FieldProps) {
  return (
    <section className="grid gap-1.5">
      <Label htmlFor={id} id={`${id}-label`}>
        {label}
      </Label>
      <small id={`${id}-help`} className={error ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
        {error ?? help}
      </small>
      {children}
    </section>
  );
}

type NumberFieldProps = Omit<FieldProps, "children"> & { value: string; onChange: (v: string) => void };

export function NumberField({ value, onChange, ...field }: NumberFieldProps) {
  return (
    <Field {...field}>
      <Input
        id={field.id}
        inputMode="numeric"
        aria-invalid={Boolean(field.error)}
        aria-describedby={`${field.id}-help`}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
        className="font-mono tabular-nums"
      />
    </Field>
  );
}
