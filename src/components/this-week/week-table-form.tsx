"use client";

import { useMemo, useState } from "react";

import { resetWeekPicks, saveWeekPicks } from "@/app/this-week/edit/actions";
import { ListingTypeBadge } from "@/components/listing-type-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney, stallById, type Listing } from "@/lib/commerce";
import {
  listingHubName,
  listingStatusLabel,
} from "@/lib/listing-display";
import {
  clearWeekPickOverlay,
  defaultWeekPickIds,
  isEligibleWeekPick,
  sanitizeWeekPickIds,
  writeWeekPickIds,
} from "@/lib/week-overlay";

type WeekTableFormProps = {
  initialIds: string[];
  fromOverlay: boolean;
  eligible: Listing[];
  rejected: Listing[];
};

export function WeekTableForm({
  initialIds,
  fromOverlay,
  eligible,
  rejected,
}: WeekTableFormProps) {
  const [selected, setSelected] = useState<string[]>(initialIds);
  const [error, setError] = useState<string | null>(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const physical = eligible.filter((listing) => listing.type === "physical");
  const digital = eligible.filter((listing) => listing.type === "digital");
  const preview = sanitizeWeekPickIds(selected);

  function toggle(id: string, listing: Listing) {
    if (!isEligibleWeekPick(listing)) {
      return;
    }
    setError(null);
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function onSave(formData: FormData) {
    setError(null);
    const ids = formData
      .getAll("listingId")
      .map((value) => String(value))
      .filter((id) => id.length > 0);
    writeWeekPickIds(ids);
    return saveWeekPicks(formData);
  }

  function onReset() {
    setError(null);
    clearWeekPickOverlay();
    setSelected(defaultWeekPickIds());
    return resetWeekPicks();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <form action={onSave} className="space-y-8">
        <PickGroup
          legend="Things you can hold"
          listings={physical}
          selected={selectedSet}
          onToggle={toggle}
        />
        <PickGroup
          legend="Files from the same table"
          listings={digital}
          selected={selectedSet}
          onToggle={toggle}
        />

        {rejected.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-sm font-medium">Cannot sit here</h2>
            <ul className="grid gap-2">
              {rejected.map((listing) => (
                <li
                  key={listing.id}
                  className="rounded-xl bg-muted/50 px-4 py-3 text-sm leading-6 text-muted-foreground ring-1 ring-foreground/8"
                >
                  <span className="font-medium text-foreground/80">
                    {listing.title}
                  </span>
                  {" — "}
                  {listing.status === "sold"
                    ? "sold. The drop does not revive a chair."
                    : "file gone. The drop does not reprint a missing zine."}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-[oklch(0.97_0.02_25)] px-4 py-3 text-sm leading-6 text-foreground"
          >
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="submit"
            size="lg"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
          >
            Tape this table
          </Button>
        </div>
      </form>

      <aside className="space-y-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 lg:sticky lg:top-28 lg:self-start">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          This weekend
        </p>
        <h2 className="font-heading text-2xl tracking-tight">
          {preview.length === 0
            ? "Empty table"
            : `${preview.length} ${preview.length === 1 ? "tag" : "tags"}`}
        </h2>
        {preview.length === 0 ? (
          <p className="text-sm leading-6 text-muted-foreground">
            Nothing checked. Save that and the drop will say the table is
            empty. Sold and file-gone never count.
          </p>
        ) : (
          <ol className="space-y-2 text-sm leading-6">
            {preview.map((id, index) => {
              const listing = eligible.find((item) => item.id === id);
              if (!listing) return null;
              return (
                <li key={id} className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0">
                    <span className="text-muted-foreground">{index + 1}. </span>
                    {listing.title}
                  </span>
                  <span className="shrink-0 font-heading">
                    {formatMoney(listing.price)}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
        <p className="text-sm leading-6 text-muted-foreground">
          {fromOverlay
            ? "This browser already has an overlay. Save to replace it. Reset puts the mall fixtures back."
            : "Fixture defaults until you tape something. Local overlay. No account. No deploy."}
        </p>
        <form action={onReset}>
          <Button
            type="submit"
            variant="outline"
            className="h-11 w-full rounded-full px-5"
          >
            Reset to mall fixtures
          </Button>
        </form>
      </aside>
    </div>
  );
}

function PickGroup({
  legend,
  listings,
  selected,
  onToggle,
}: {
  legend: string;
  listings: Listing[];
  selected: Set<string>;
  onToggle: (id: string, listing: Listing) => void;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">{legend}</legend>
      <ul className="grid gap-2">
        {listings.map((listing) => {
          const checked = selected.has(listing.id);
          const stall = stallById(listing.stallId);

          return (
            <li key={listing.id}>
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl px-4 py-3 ring-1 transition-shadow ${
                  checked
                    ? "bg-card ring-foreground/20"
                    : "bg-card/50 ring-foreground/10 hover:ring-foreground/20"
                }`}
              >
                <input
                  type="checkbox"
                  name="listingId"
                  value={listing.id}
                  checked={checked}
                  onChange={() => onToggle(listing.id, listing)}
                  className="mt-1 size-4 shrink-0 accent-foreground"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <ListingTypeBadge listing={listing} />
                    <Badge variant="ghost">{listingStatusLabel(listing)}</Badge>
                    <Badge variant="outline">{listingHubName(listing)}</Badge>
                  </span>
                  <span className="mt-1 block font-heading text-lg leading-snug tracking-tight">
                    {listing.title}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                    {stall?.boothName ?? listing.stallId}
                    {" · "}
                    {formatMoney(listing.price)}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
