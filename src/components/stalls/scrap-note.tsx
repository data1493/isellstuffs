import { buttonVariants } from "@/components/ui/button";
import { stallScrapPeelPath } from "@/lib/paths";
import type { StallScrap } from "@/lib/stall-scrap";
import { cn } from "@/lib/utils";

export function ScrapNote({
  scrap,
  slug,
}: {
  scrap: StallScrap;
  slug: string;
}) {
  return (
    <article
      data-stall-scrap=""
      data-stall-scrap-id={scrap.id}
      data-stall-id={scrap.stallId}
      className="rounded-2xl border-2 border-dashed border-primary/30 bg-[oklch(0.98_0.02_85)] px-5 py-5 ring-1 ring-primary/10"
      aria-label={scrap.note}
    >
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Taped sticky
      </p>
      <p className="mt-2 font-heading text-2xl leading-snug tracking-tight text-balance">
        {scrap.note}
      </p>
      <form method="post" action={stallScrapPeelPath(slug)} className="mt-4">
        <input type="hidden" name="scrapId" value={scrap.id} />
        <button
          type="submit"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-10 w-full rounded-full sm:w-auto",
          )}
        >
          Peel this scrap
        </button>
      </form>
    </article>
  );
}
