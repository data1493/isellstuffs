import Link from "next/link";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallSection, MallWidth } from "@/components/mall-shell";
import { MallNotice } from "@/components/mall-notice";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  shakeGhostCopy,
  shakeLineBooth,
  shakeLineTitle,
  type ShakeNotice,
  type ShakeRow,
} from "@/lib/cart-shake";
import { formatMoney } from "@/lib/commerce";
import { cartShakePath, listingPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

function ShakeForm({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <form action={cartShakePath()} method="post" className={className}>
      <input type="hidden" name="returnTo" value={cartShakePath()} />
      <button
        type="submit"
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full px-5")}
      >
        {label}
      </button>
    </form>
  );
}

function ShakeLine({
  row,
  kind,
}: {
  row: ShakeRow;
  kind: "kept" | "ghost";
}) {
  const title = shakeLineTitle(row);
  const booth = shakeLineBooth(row);
  const price = row.listing ? formatMoney(row.listing.price) : null;
  const href = row.listing ? listingPath(row.listing.id) : undefined;

  return (
    <li>
      <Card
        className={cn(
          "gap-0 bg-card py-0",
          kind === "ghost" && "bg-muted/50",
        )}
        data-shake-line={kind}
        data-listing-id={row.id}
        data-shake-reason={row.reason ?? "still-here"}
      >
        <CardHeader className="gap-2 py-4 sm:grid sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={kind === "ghost" ? "destructive" : "outline"}>
                {kind === "ghost"
                  ? shakeGhostCopy(row.reason ?? "not-eligible")
                  : "Still here"}
              </Badge>
              <span className="text-xs text-muted-foreground">{booth}</span>
            </div>
            <CardTitle className="font-heading text-lg leading-snug">
              {href ? (
                <Link href={href} className="underline-offset-4 hover:underline">
                  {title}
                </Link>
              ) : (
                title
              )}
            </CardTitle>
            {row.listing ? (
              <CardDescription className="leading-6">
                {row.listing.summary}
              </CardDescription>
            ) : (
              <CardDescription className="leading-6">
                This id is in the bag but not on the floor. Shake drops it.
              </CardDescription>
            )}
          </div>
          {price ? (
            <p className="font-heading text-xl">{price}</p>
          ) : null}
        </CardHeader>
      </Card>
    </li>
  );
}

export function ShakeDesk({
  kept,
  dropped,
  notice,
}: {
  kept: ShakeRow[];
  dropped: ShakeRow[];
  notice?: ShakeNotice;
}) {
  const bagEmpty = kept.length === 0 && dropped.length === 0;
  const hasGhosts = dropped.length > 0;
  const state = notice ?? (bagEmpty ? "empty" : hasGhosts ? "ghosts" : "clean");

  return (
    <div
      data-shake="desk"
      data-shake-state={state}
      data-shake-kept={kept.map((row) => row.id).join(",")}
      data-shake-dropped={dropped.map((row) => row.id).join(",")}
      className={hasGhosts ? "pb-28 lg:pb-0" : undefined}
    >
      <MallHero>
        <MallCrumb label="Shake the tote">
          <CrumbSep />
          <Link href="/cart" className="hover:text-foreground hover:underline">
            Tote
          </Link>
          <CrumbSep />
          <span className="text-foreground">Shake</span>
        </MallCrumb>
        <MallEyebrow>After a fat bag</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Shake the tote.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            A fat bag can hold a sold chair next to a still-here lamp. Shake
            drops sold stickers, packed booths, pulled files, and ids that are
            not on the floor. What is still here stays in the bag.
          </p>
        </div>
      </MallHero>

      <MallSection>
        {notice === "dropped" ? (
          <MallNotice
            padded={false}
            tone="empty"
            eyebrow="Shook"
            title="Ghosts hit the floor."
            body="Sold chairs and packed leftovers left the bag. What is still here stayed."
            className="mb-10"
            actions={
              <Button
                className="rounded-full px-5"
                render={<Link href="/cart" />}
              >
                Open the tote
              </Button>
            }
          />
        ) : null}

        {notice === "clean" ? (
          <MallNotice
            padded={false}
            tone="empty"
            eyebrow="Shook"
            title="Nothing to drop."
            body="Every find in the bag is still here. The lamp stays."
            className="mb-10"
            actions={
              <Button
                className="rounded-full px-5"
                render={<Link href="/cart" />}
              >
                Open the tote
              </Button>
            }
          />
        ) : null}

        {bagEmpty && notice !== "dropped" ? (
          <MallNotice
            padded={false}
            tone="empty"
            eyebrow="Empty tote"
            title="The bag is slack."
            body="Nothing in here to shake. Add a find from a listing or a stall, then come back if a sold chair sneaks in."
            actions={
              <>
                <Button
                  className="rounded-full px-5"
                  render={<Link href="/listings/ysk-wobbly-lamp" />}
                >
                  Open the lamp
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-5"
                  render={<Link href="/cart" />}
                >
                  Open the tote
                </Button>
              </>
            }
          />
        ) : bagEmpty ? null : (
          <div className="grid gap-10 lg:grid-cols-2">
            <section className="space-y-4">
              <div>
                <h2 className="font-heading text-2xl tracking-tight">Ghosts</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Sold, packed, pulled, or missing. Shake drops these.
                </p>
              </div>
              {hasGhosts ? (
                <ul className="space-y-3">
                  {dropped.map((row) => (
                    <ShakeLine key={row.id} row={row} kind="ghost" />
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  No ghosts in this bag.
                </p>
              )}
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="font-heading text-2xl tracking-tight">Still here</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  These stay in the tote after a shake.
                </p>
              </div>
              {kept.length > 0 ? (
                <ul className="space-y-3">
                  {kept.map((row) => (
                    <ShakeLine key={row.id} row={row} kind="kept" />
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  Nothing still here. Shake empties the bag.
                </p>
              )}
              {hasGhosts ? (
                <div className="hidden lg:block">
                  <ShakeForm label="Shake the tote" />
                </div>
              ) : null}
            </section>
          </div>
        )}
      </MallSection>

      {hasGhosts ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm lg:hidden">
          <MallWidth className="px-0">
            <ShakeForm label="Shake the tote" />
          </MallWidth>
        </div>
      ) : null}
    </div>
  );
}
