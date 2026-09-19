import { buttonVariants } from "@/components/ui/button";
import {
  BOOTH_COVER_PAPER_LINE,
  neighborStalls,
  type BoothCover,
} from "@/lib/booth-cover";
import { stallCoverPath, stallCoverWritePath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function BoothCoverForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothCover;
}) {
  const cover = stallCoverPath(slug);
  const neighbors = neighborStalls(stallId);

  return (
    <div className="space-y-4">
      <form method="post" action={stallCoverWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={cover} />
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Who is sitting?</legend>
          <p className="text-sm leading-6 text-muted-foreground">
            A real catalog booth. Not this table.
          </p>
          <div className="grid gap-2">
            {neighbors.map((neighbor) => (
              <label
                key={neighbor.id}
                className="flex cursor-pointer items-start gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/10 has-[:checked]:bg-secondary/60 has-[:checked]:ring-primary/30"
              >
                <input
                  type="radio"
                  name="sitterId"
                  value={neighbor.id}
                  defaultChecked={current?.sitterId === neighbor.id}
                  className="mt-1 size-4 shrink-0 accent-foreground"
                />
                <span>
                  <span className="block font-medium">{neighbor.boothName}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                    {neighbor.blurb}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the sitter
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_COVER_PAPER_LINE} One booth. One neighbor.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallCoverWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="sitterId" value="" />
          <input type="hidden" name="returnTo" value={cover} />
          <button
            type="submit"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 w-full rounded-full",
            )}
          >
            Clear this booth
          </button>
        </form>
      ) : null}
    </div>
  );
}
