"use client";

import { useState } from "react";

import { ListingTypeBadge } from "@/components/listing-type-badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatMoney,
  hubById,
  mallHubs,
  money,
  stallById,
  type HubId,
  type Listing,
} from "@/lib/commerce";
import { sellListingRetapePath } from "@/lib/paths";
import { isPhysicalHubId } from "@/lib/seller-listing";
import { isGiftFileFormat } from "@/lib/sell-start";
import { cn } from "@/lib/utils";

function dollarsFromCents(cents: number) {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? String(dollars) : dollars.toFixed(2);
}

function dollarsToCents(value: string) {
  const dollars = Number(value);
  if (!Number.isFinite(dollars) || dollars <= 0) {
    return 0;
  }
  return Math.round(dollars * 100);
}

function fieldValue(target: EventTarget | null) {
  if (
    !(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)
  ) {
    return "";
  }
  return target.value;
}

export function RetapeForm({
  listing,
  error,
}: {
  listing: Listing;
  error?: string;
}) {
  const stall = stallById(listing.stallId);
  const [hubId, setHubId] = useState<HubId>(
    listing.type === "digital" ? "download-stall" : listing.hubId,
  );
  const [title, setTitle] = useState(listing.title);
  const [summary, setSummary] = useState(listing.summary);
  const [price, setPrice] = useState(dollarsFromCents(listing.price.amountCents));
  const [condition, setCondition] = useState(
    listing.type === "physical" ? listing.condition : "",
  );
  const [fileFormat, setFileFormat] = useState(
    listing.type === "digital" ? listing.fileFormat : "PDF",
  );
  const [giftError, setGiftError] = useState<string | null>(null);

  const cents = dollarsToCents(price) || listing.price.amountCents;
  const preview: Listing =
    listing.type === "digital"
      ? {
          id: listing.id,
          stallId: listing.stallId,
          type: "digital",
          title: title || "Untitled file",
          summary: summary || "A file from this stall.",
          hubId: "download-stall",
          price: money(cents),
          fileFormat: fileFormat || "PDF",
          cartEligible: listing.cartEligible,
          status: listing.status,
        }
      : {
          id: listing.id,
          stallId: listing.stallId,
          type: "physical",
          title: title || "Untitled junk",
          summary: summary || "Something that can sit on a folding table.",
          hubId,
          price: money(cents),
          condition: condition || "scuffed",
          cartEligible: listing.cartEligible,
          status: listing.status,
        };

  const aisle = hubById(listing.type === "digital" ? "download-stall" : hubId);

  return (
    <form
      action={sellListingRetapePath(listing.id)}
      method="post"
      onSubmit={(event) => {
        if (listing.type === "digital" && isGiftFileFormat(fileFormat)) {
          event.preventDefault();
          setGiftError(
            "The mall already sells one gift card. Retape a file — PDF, WAV, OTF.",
          );
        }
      }}
      className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
    >
      <input type="hidden" name="type" value={listing.type} />
      <input type="hidden" name="stallId" value={listing.stallId} />

      <div className="space-y-6">
        <div className="rounded-xl bg-card/80 p-4 ring-1 ring-foreground/10">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Already taped
          </p>
          <p className="mt-1 font-heading text-lg tracking-tight">
            {stall?.boothName ?? "This booth"}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {listing.type === "physical"
              ? "Same SKU. Same booth. Fix the title, the sentence, the price, or the aisle."
              : "Same SKU. Files stay in Download Stall. Not a second gift card."}
          </p>
        </div>

        {listing.type === "physical" ? (
          <div className="space-y-2">
            <Label htmlFor="hubId">Aisle</Label>
            <input type="hidden" name="hubId" value={hubId} />
            <div className="grid gap-2">
              {mallHubs
                .filter((hub) => isPhysicalHubId(hub.id))
                .map((hub) => {
                  const selected = hubId === hub.id;
                  return (
                    <button
                      key={hub.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setHubId(hub.id)}
                      className={`w-full rounded-xl px-4 py-3 text-left ring-1 transition-shadow ${
                        selected
                          ? "bg-card ring-foreground/20"
                          : "bg-card/50 ring-foreground/10 hover:ring-foreground/20"
                      }`}
                    >
                      <p className="font-heading text-lg tracking-tight">
                        {hub.name}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {hub.rule}
                      </p>
                    </button>
                  );
                })}
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-card/80 p-4 ring-1 ring-foreground/10">
            <input type="hidden" name="hubId" value="download-stall" />
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Aisle
            </p>
            <p className="mt-1 font-heading text-lg tracking-tight">
              Download Stall
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Digital stays in this aisle. The booth is still{" "}
              {stall?.boothName ?? "the same table"}.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={listing.title}
            onInput={(event) => setTitle(fieldValue(event.target))}
            placeholder={
              listing.type === "physical"
                ? "Tape drawer mug"
                : "How to price your junk (PDF)"
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">What it is</Label>
          <Textarea
            id="summary"
            name="summary"
            defaultValue={listing.summary}
            onInput={(event) => setSummary(fieldValue(event.target))}
            placeholder={
              listing.type === "physical"
                ? "Chip on the rim. Holds coffee."
                : "One page. A rule of thumb. Written on a folding table."
            }
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              defaultValue={dollarsFromCents(listing.price.amountCents)}
              onInput={(event) =>
                setPrice(
                  fieldValue(event.target) ||
                    dollarsFromCents(listing.price.amountCents),
                )
              }
              required
            />
            <p className="text-sm leading-6 text-muted-foreground">
              The mall keeps 10% from this price, not on top of the buyer.
            </p>
          </div>
          {listing.type === "physical" ? (
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Input
                id="condition"
                name="condition"
                defaultValue={listing.type === "physical" ? listing.condition : ""}
                onInput={(event) => setCondition(fieldValue(event.target))}
                placeholder="scuffed"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="fileFormat">File format</Label>
              <Input
                id="fileFormat"
                name="fileFormat"
                defaultValue={
                  listing.type === "digital" ? listing.fileFormat : "PDF"
                }
                onInput={(event) => {
                  const next = fieldValue(event.target) || "PDF";
                  setFileFormat(next);
                  if (!isGiftFileFormat(next)) {
                    setGiftError(null);
                  }
                }}
                placeholder="PDF"
                required
              />
            </div>
          )}
        </div>

        {error || giftError ? (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-[oklch(0.97_0.02_25)] px-4 py-3 text-sm leading-6 text-foreground"
          >
            {giftError ?? error}
          </p>
        ) : null}

        <button
          type="submit"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 w-full rounded-full px-5 sm:w-auto",
          )}
        >
          Retape the tag
        </button>
      </div>

      <aside className="space-y-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 lg:sticky lg:top-28 lg:self-start">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Preview
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <ListingTypeBadge listing={preview} />
          <span className="text-xs text-muted-foreground">{aisle.name}</span>
        </div>
        <h2 className="font-heading text-2xl tracking-tight">{preview.title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{preview.summary}</p>
        <p className="font-heading text-xl">{formatMoney(preview.price)}</p>
        <p className="text-sm leading-6 text-muted-foreground">
          {listing.type === "physical"
            ? `Condition: ${preview.type === "physical" ? preview.condition : ""}`
            : `Format: ${preview.type === "digital" ? preview.fileFormat : ""}`}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          Same SKU. The URL stays /listings/{listing.id}.
        </p>
      </aside>
    </form>
  );
}
