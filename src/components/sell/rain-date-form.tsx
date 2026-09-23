import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Stall } from "@/lib/commerce";
import type { RainDateTape } from "@/lib/rain-date";
import { RAIN_DATE_MIRROR_SCRIPT } from "@/lib/rain-date";
import { rainPath, sellRainPath, sellRainWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function RainDateForm({
  stall,
  taped,
  emptyError,
}: {
  stall: Stall;
  taped?: RainDateTape;
  emptyError?: boolean;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <script dangerouslySetInnerHTML={{ __html: RAIN_DATE_MIRROR_SCRIPT }} />

      <div className="space-y-6">
        {emptyError ? (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-[oklch(0.97_0.02_25)] px-4 py-3 text-sm leading-6 text-foreground"
          >
            Tape Sunday hours, a place, and why — or leave the driveway Saturday.
          </p>
        ) : null}

        <form action={sellRainWritePath()} method="post" className="space-y-6">
          <input type="hidden" name="stallId" value={stall.id} />
          <input type="hidden" name="intent" value="tape" />
          <input type="hidden" name="returnTo" value={sellRainPath(stall.slug)} />

          <div className="space-y-2">
            <label htmlFor="hours" className="text-sm font-medium">
              Sunday hours
            </label>
            <Input
              id="hours"
              name="hours"
              defaultValue={taped?.hours ?? ""}
              placeholder="Sunday 9–2"
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
              defaultValue={taped?.place ?? ""}
              placeholder="Same driveway"
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="note" className="text-sm font-medium">
              If Saturday is wet
            </label>
            <Textarea
              id="note"
              name="note"
              defaultValue={taped?.note ?? ""}
              placeholder="If Saturday is wet."
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
            Tape the rain date
          </button>
        </form>

        {taped ? (
          <form action={sellRainWritePath()} method="post">
            <input type="hidden" name="stallId" value={stall.id} />
            <input type="hidden" name="intent" value="restore" />
            <input
              type="hidden"
              name="returnTo"
              value={sellRainPath(stall.slug)}
            />
            <button
              type="submit"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 w-full rounded-full px-5 sm:w-auto",
              )}
            >
              Restore — no rain date
            </button>
          </form>
        ) : null}
      </div>

      <aside className="space-y-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 lg:sticky lg:top-28 lg:self-start">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          If Saturday is wet
        </p>
        <p className="font-heading text-2xl tracking-tight">{stall.boothName}</p>
        {taped ? (
          <>
            <p data-rain-current="" className="font-heading text-lg tracking-tight">
              {taped.hours}
            </p>
            <p className="text-sm leading-6 text-foreground">{taped.place}</p>
            <p className="text-sm leading-6 text-muted-foreground">{taped.note}</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Taped for Sunday. The lamp PDP still recites Saturday.
            </p>
          </>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            Saturday hours stay on the stall. Tape Sunday only if the driveway
            needs a wet-weather card.
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            href={rainPath()}
            className="inline-flex h-11 w-full items-center justify-center rounded-full px-5 text-sm font-medium text-foreground underline-offset-4 hover:underline sm:w-auto"
          >
            See rain Sunday
          </Link>
          <Link
            href={stallPath(stall.slug)}
            className="inline-flex h-11 w-full items-center justify-center rounded-full px-5 text-sm font-medium text-foreground underline-offset-4 hover:underline sm:w-auto"
          >
            See the booth
          </Link>
        </div>
      </aside>
    </div>
  );
}
