import { buttonVariants } from "@/components/ui/button";
import type { BuyTitle } from "@/lib/booth-buys";
import { stallBuyWritePath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function BoothBuysTitle({
  item,
  slug,
}: {
  item: BuyTitle;
  slug: string;
}) {
  return (
    <article
      data-booth-buy=""
      data-booth-buy-title={item.title}
      data-booth-buy-id={item.id}
      data-booth-buy-stall-id={item.stallId}
      className="rounded-2xl border-2 border-dashed border-primary/30 bg-[oklch(0.98_0.02_85)] px-5 py-5 ring-1 ring-primary/10"
      aria-label={item.title}
    >
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        This booth buys
      </p>
      <p className="mt-2 font-heading text-2xl leading-snug tracking-tight text-balance">
        {item.title}
      </p>
      <form method="post" action={stallBuyWritePath()} className="mt-4">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="intent" value="peel" />
        <input type="hidden" name="titleId" value={item.id} />
        <button
          type="submit"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-10 w-full rounded-full sm:w-auto",
          )}
        >
          Peel this title
        </button>
      </form>
    </article>
  );
}
