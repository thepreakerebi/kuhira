import { Skeleton } from "@/components/ui/skeleton";

export function FarmerSkeleton() {
  return (
    <section className="grid gap-6" aria-hidden>
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-10 w-3/4 max-w-xl" />
      <Skeleton className="h-5 w-full max-w-2xl" />
      <section className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-6">
        <Skeleton className="h-[30rem] rounded-xl" />
        <Skeleton className="h-[20rem] rounded-xl" />
      </section>
    </section>
  );
}
