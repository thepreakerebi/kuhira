import Link from "next/link";
import { NavLinks } from "@/components/site/nav-links";
import { shell } from "@/components/site/page-shell";

export function SiteHeader() {
  return (
    <header className="border-b bg-card">
      <nav aria-label="Main" className={`${shell} flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3`}>
        <Link href="/" className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight">
          <svg aria-hidden viewBox="0 0 24 24" className="size-6">
            <path d="M12 2.5c3.6 4.6 6 8.2 6 11.3a6 6 0 1 1-12 0c0-3.1 2.4-6.7 6-11.3Z" fill="#c3d898" stroke="#4a6420" strokeWidth="1.5" />
          </svg>
          Kuhira
        </Link>
        <NavLinks />
      </nav>
    </header>
  );
}
