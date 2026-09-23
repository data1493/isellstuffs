import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Stall } from "@/lib/commerce";
import type { StallPickupNote } from "@/lib/pickup-display";
import { sellHoursPath, sellHoursSavePath, stallPath } from "@/lib/paths";
import { WEEKEND_HOURS_MIRROR_SCRIPT } from "@/lib/weekend-hours";
import { cn } from "@/lib/utils";

export function WeekendHoursForm({
  stall,
  current,
  taped,
  emptyError,
}: {
  stall: Stall;
  current: StallPickupNote;
  taped: boolean;
  emptyError?: boolean;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <script dangerouslySetInnerHTML={{ __html: WEEKEND_HOURS_MIRROR_SCRIPT }} />

      <div className="space-y-6">
        {emptyError ? (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-[oklch(0.97_0.02_25)] px-4 py-3 text-sm leading-6 text-foreground"
          >
            Tape the hours or leave the fixture.
          </p>
        ) : null}

        <form action={sellHoursSavePath()} method="post" className="space-y-6">
          <input type="hidden" name="stallId" value={stall.id} />
          <input type="hidden" name="intent" value="tape" />
          <input type="hidden" name="returnTo" value={sellHoursPath(stall.slug)} />

          <div className="space-y-2">
            <label htmlFor="hours" className="text-sm font-medium">
              Hours
            </label>
            <Input
              id="hours"
              name="hours"
              defaultValue={current.hours}
              placeholder="Sat 9–2"
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="place" className="text-sm font-medium">
              Place
            </label>
            <Input
              id="place"
              name="place"
              defaultValue={current.place}
              placeholder="Same driveway"
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="note" className="text-sm font-medium">
              Note
            </label>
            <Textarea
              id="note"
              name="note"
              defaultValue={current.note}
              placeholder="Table is out this weekend."
              required
            />
          </div>

          <button
            type="submit"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 w-full rounded-full px-5 sm:w-auto",
            )}
          >
            Tape this weekend
          </button>
        </form>

        {taped ? (
          <form action={sellHoursSavePath()} method="post">
            <input type="hidden" name="stallId" value={stall.id} />
            <input type="hidden" name="intent" value="restore" />
            <input
              type="hidden"
              name="returnTo"
              value={sellHoursPath(stall.slug)}
            />
            <button
              type="submit"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 w-full rounded-full px-5 sm:w-auto",
              )}
            >
              Restore the fixture
            </button>
          </form>
        ) : null}
      </div>

      <aside className="space-y-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 lg:sticky lg:top-28 lg:self-start">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          On the driveway now
        </p>
        <p className="font-heading text-2xl tracking-tight">{stall.boothName}</p>
        <p data-hours-current="" className="font-heading text-lg tracking-tight">
          {current.hours}
        </p>
        <p className="text-sm leading-6 text-foreground">{current.place}</p>
        <p className="text-sm leading-6 text-muted-foreground">{current.note}</p>
        <p className="text-sm leading-6 text-muted-foreground">
          {taped
            ? "Taped for this Saturday. Pickup and the stall read this card."
            : "Fixture hours until you tape. Pickup still recites the catalog."}
        </p>
        <Link
          href={stallPath(stall.slug)}
          className="inline-flex h-11 w-full items-center justify-center rounded-full px-5 text-sm font-medium text-foreground underline-offset-4 hover:underline sm:w-auto"
        >
          See the booth
        </Link>
      </aside>
    </div>
  );
}
