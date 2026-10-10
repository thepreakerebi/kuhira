"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Planner", match: (p: string) => p === "/" },
  { href: "/farmer/rw", label: "Farmer", match: (p: string) => p.startsWith("/farmer") },
  { href: "/method", label: "Method", match: (p: string) => p.startsWith("/method") },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-1 text-sm">
      {LINKS.map((l) => {
        const active = l.match(pathname);
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 font-medium transition-colors hover:bg-muted",
                active && "bg-secondary text-secondary-foreground hover:bg-secondary",
              )}
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
