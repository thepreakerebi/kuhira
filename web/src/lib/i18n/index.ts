import { notFound } from "next/navigation";
import { en, type Messages } from "@/lib/i18n/en";
import { rw } from "@/lib/i18n/rw";

export const LANGS = ["en", "rw"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";
export type { Messages };

export const messages: Record<Lang, Messages> = { en, rw };

export function isLang(v: string): v is Lang {
  return (LANGS as readonly string[]).includes(v);
}

export function cropName(lang: Lang, crop: string): string {
  return messages[lang].crops[crop] ?? crop;
}

/** The language a path is in: its first segment, or the default. */
export function langFromPath(pathname: string): Lang {
  const first = pathname.split("/")[1] ?? "";
  return isLang(first) ? first : DEFAULT_LANG;
}

/** The same page in another language. */
export function switchLangPath(pathname: string, lang: Lang): string {
  const parts = pathname.split("/");
  if (isLang(parts[1] ?? "")) parts[1] = lang;
  else parts.splice(1, 0, lang);
  return parts.join("/").replace(/\/$/, "") || `/${lang}`;
}

/** A route's language, or the not-found page for anything else. */
export function langOrNotFound(value: string): Lang {
  if (!isLang(value)) notFound();
  return value;
}
