"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FarmerResult } from "@/components/farmer/farmer-result";
import { ChoiceGroup } from "@/components/site/choice-group";
import { Combobox, type ComboboxGroup } from "@/components/site/combobox";
import { Field, NumberField } from "@/components/site/field";
import { stagger } from "@/components/motion/stagger";
import { postJson } from "@/lib/api-url";
import { cropName, type Lang, messages } from "@/lib/i18n";
import type { Crop, Defaults, District, FarmerEstimate, FarmerRequest } from "@/lib/types";

type KitChoice = "treadle" | "petrol" | "own";
const PROVINCE_ORDER = ["Kigali", "North", "South", "East", "West"];

function districtGroups(lang: Lang, districts: District[]): ComboboxGroup[] {
  const provinces = messages[lang].provinces;
  return PROVINCE_ORDER.map((p) => ({
    label: provinces[p] ?? p,
    options: districts
      .filter((d) => d.province === p)
      .map((d) => ({ value: d.district, label: d.district, keywords: [provinces[p] ?? p] })),
  })).filter((g) => g.options.length > 0);
}
type Props = { lang: Lang; defaults: Defaults; crops: Crop[]; districts: District[] };

function PickOne(props: { id: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <Select value={props.value} onValueChange={props.onChange}>
      <SelectTrigger id={props.id} aria-describedby={`${props.id}-help`} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {props.options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function FarmerCalculator({ lang, defaults, crops, districts }: Props) {
  const t = messages[lang].farmer;
  const [district, setDistrict] = useState(districts[0].district);
  const [crop, setCrop] = useState("Maize");
  const [area, setArea] = useState("500");
  const [kit, setKit] = useState<KitChoice>("treadle");
  const [ownPrice, setOwnPrice] = useState("");
  const [solar, setSolar] = useState<"regular" | "solar">("regular");
  const [estimate, setEstimate] = useState<FarmerEstimate | null>(null);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [touched, setTouched] = useState(false);

  const areaM2 = Number(area);
  const kitCost = kit === "own" ? Number(ownPrice) : defaults.kits[kit].cost_rwf;
  const errors = {
    area: !area || areaM2 <= 0 || areaM2 > 100_000 ? t.areaError : undefined,
    price: kit === "own" && (!ownPrice || kitCost <= 0) ? t.kitPriceError : undefined,
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (errors.area || errors.price) return;
    const body: FarmerRequest = {
      district,
      crop,
      area_m2: areaM2,
      kit_cost_rwf: kitCost,
      subsidy_rate: solar === "solar" ? defaults.subsidy_solar : defaults.subsidy_regular,
    };
    setPending(true);
    try {
      setEstimate(await postJson<FarmerEstimate>("/farmer", body));
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  const modelled = crops.filter((c) => c.bonus_pct !== null);
  return (
    <section className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] items-start gap-[clamp(1rem,2.5vw,1.75rem)]">
      <Card style={stagger(1)} className="kuhira-rise">
        <CardContent>
          <form onSubmit={submit} noValidate className="grid gap-5">
            <Field id="district" label={t.district} help={t.districtHelp}>
              <Combobox
                id="district"
                value={district}
                onChange={setDistrict}
                groups={districtGroups(lang, districts)}
                searchLabel={t.districtSearch}
                emptyLabel={t.districtEmpty}
              />
            </Field>
            <Field id="crop" label={t.crop} help={t.cropHelp}>
              <PickOne id="crop" value={crop} onChange={setCrop}
                options={modelled.map((c) => ({ value: c.crop, label: cropName(lang, c.crop) }))} />
            </Field>
            <NumberField id="area" label={t.area} help={t.areaHelp} value={area} onChange={setArea}
              error={touched ? errors.area : undefined} />
            <Field id="kit" label={t.kit} help={t.kitHelp}>
              <ChoiceGroup id="kit" value={kit} onChange={setKit}
                options={(["treadle", "petrol", "own"] as const).map((k) => ({ value: k, label: t.kits[k] }))} />
            </Field>
            {kit === "own" ? (
              <NumberField id="price" label={t.kitPrice} help={t.kitPriceHelp} value={ownPrice} onChange={setOwnPrice}
                error={touched ? errors.price : undefined} />
            ) : null}
            <Field id="subsidy" label={t.subsidy} help={t.subsidyHelp}>
              <ChoiceGroup id="subsidy" value={solar} onChange={setSolar}
                options={[{ value: "regular", label: t.subsidyRegular }, { value: "solar", label: t.subsidySolar }]} />
            </Field>
            <Button type="submit" size="lg" disabled={pending} className="w-full">
              {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
              {t.submit}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section style={stagger(2)} className="kuhira-rise grid gap-4" aria-live="polite">
        {failed ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{t.error}</AlertDescription>
          </Alert>
        ) : null}
        <FarmerResult lang={lang} estimate={estimate} />
      </section>
    </section>
  );
}
