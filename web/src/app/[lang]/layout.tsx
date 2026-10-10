import { LANGS } from "@/lib/i18n";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default function LangLayout({ children }: LayoutProps<"/[lang]">) {
  return children;
}
