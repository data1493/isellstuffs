import { buttonVariants } from "@/components/ui/button";
import { wantedPeelPath } from "@/lib/paths";
import type { Hunt } from "@/lib/wanted";
import { cn } from "@/lib/utils";

export function HuntScrap({ hunt }: { hunt: Hunt }) {
  return (
    <article
      className="rounded-2xl border-2 border-dashed border-primary/30 bg-[oklch(0.98_0.02_85)] px-5 py-5 ring-1 ring-primary/10"
      aria-label={hunt.note}
    >
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Taped hunt
      </p>
      <p className="mt-2 font-heading text-2xl leading-snug tracking-tight text-balance">
        {hunt.note}
      </p>
      <form method="post" action={wantedPeelPath()} className="mt-4">
        <input type="hidden" name="huntId" value={hunt.id} />
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
