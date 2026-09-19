import { buttonVariants } from "@/components/ui/button";
import type { FreeTitle } from "@/lib/free-box";
import { stallFreeWritePath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function FreeBoxTitle({
  item,
  slug,
}: {
  item: FreeTitle;
  slug: string;
}) {
  return (
    <article
      data-free-box=""
      data-free-box-title={item.title}
      data-free-box-id={item.id}
      data-free-box-stall-id={item.stallId}
      className="rounded-2xl border-2 border-dashed border-primary/30 bg-[oklch(0.98_0.02_85)] px-5 py-5 ring-1 ring-primary/10"
      aria-label={item.title}
    >
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Free on this booth
      </p>
      <p className="mt-2 font-heading text-2xl leading-snug tracking-tight text-balance">
        {item.title}
      </p>
      <form method="post" action={stallFreeWritePath()} className="mt-4">
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
