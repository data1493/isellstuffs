import { MallEyebrow, MallWidth } from "@/components/mall-shell";

export default function CartLoading() {
  return (
    <div>
      <section className="border-b border-border bg-[linear-gradient(180deg,var(--card),var(--background))]">
        <MallWidth className="flex flex-col gap-4 py-12 sm:py-16">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Tote
          </p>
          <div className="h-10 w-48 max-w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-full max-w-md animate-pulse rounded-lg bg-muted" />
        </MallWidth>
      </section>
      <MallWidth className="py-12 sm:py-16">
        <MallEyebrow>Still on the tables</MallEyebrow>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
            >
              <div className="aspect-[16/10] animate-pulse bg-muted" />
              <div className="space-y-2 p-4">
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </MallWidth>
    </div>
  );
}
