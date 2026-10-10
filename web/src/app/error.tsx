"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/site/empty-state";
import { shell } from "@/components/site/page-shell";

export default function PageError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className={`${shell} grid justify-items-center py-[clamp(3rem,10vw,7rem)]`}>
      <EmptyState
        icon="fluent-emoji:droplet"
        iconLabel="Data unavailable"
        title="Couldn't load the data"
        description="Check your connection and try again."
      />
      <Button onClick={retry}>Try again</Button>
    </main>
  );
}
