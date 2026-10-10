import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/site/empty-state";
import { shell } from "@/components/site/page-shell";

export default function NotFound() {
  return (
    <main className={`${shell} grid justify-items-center py-[clamp(3rem,10vw,7rem)]`}>
      <EmptyState
        icon="fluent-emoji:compass"
        iconLabel="Page not found"
        title="Page not found"
        description="This link doesn't lead anywhere. Go back to the planner."
      />
      <Button asChild>
        <Link href="/">Open the planner</Link>
      </Button>
    </main>
  );
}
