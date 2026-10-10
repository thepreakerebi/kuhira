import { shell } from "@/components/site/page-shell";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-card">
      <section className={`${shell} grid gap-2 py-6 text-sm text-muted-foreground`}>
        <p>
          Data: NISR Seasonal Agricultural Survey 2020–2025 and EICV7; CHIRPS v2.0 rainfall (UCSB Climate Hazards
          Center); district boundaries from geoBoundaries (CC BY 4.0).
        </p>
        <p>Built for the NISR Big Data Hackathon 2026 · Track 1, Agricultural Productivity.</p>
      </section>
    </footer>
  );
}
