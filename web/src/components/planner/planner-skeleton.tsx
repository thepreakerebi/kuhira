import { Skeleton } from "@/components/ui/skeleton";

export function PlannerSkeleton() {
  return (
    <section className="grid gap-6" aria-hidden>
      <Skeleton className="h-10 w-3/4 max-w-2xl" />
      <Skeleton className="h-5 w-full max-w-xl" />
      <section className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-6">
        <Skeleton className="h-[28rem] rounded-xl" />
        <Skeleton className="h-[28rem] rounded-xl" />
      </section>
      <Skeleton className="h-64 rounded-xl" />
    </section>
  );
}
