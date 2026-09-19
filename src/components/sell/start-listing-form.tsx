"use client";

import { useState } from "react";

import { ListingTypeBadge } from "@/components/listing-type-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatMoney,
  hubById,
  mallHubs,
  money,
  type HubId,
  type Listing,
  type ListingType,
  type Stall,
} from "@/lib/commerce";
import { sellListPath } from "@/lib/paths";
import { isPhysicalHubId } from "@/lib/seller-listing";
import { isGiftFileFormat } from "@/lib/sell-start";
import { cn } from "@/lib/utils";

function dollarsToCents(value: string) {
  const dollars = Number(value);
  if (!Number.isFinite(dollars) || dollars <= 0) {
    return 0;
  }
  return Math.round(dollars * 100);
}

export function StartListingForm({
  stall,
  type,
}: {
  stall: Stall;
  type: ListingType;
}) {
  const [hubId, setHubId] = useState<HubId>(
    type === "digital" ? "download-stall" : "yard-sale",
  );
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [price, setPrice] = useState("8");
  const [condition, setCondition] = useState("");
  const [fileFormat, setFileFormat] = useState("PDF");
  const [giftError, setGiftError] = useState<string | null>(null);

  const cents = dollarsToCents(price) || 800;
  const preview: Listing =
    type === "digital"
      ? {
          id: "preview",
          stallId: stall.id,
          type: "digital",
          title: title.trim() || "Untitled file",
          summary: summary.trim() || "A file from this stall.",
          hubId: "download-stall",
          price: money(cents),
          fileFormat: fileFormat.trim() || "PDF",
          cartEligible: true,
          status: "available",
        }
      : {
          id: "preview",
          stallId: stall.id,
          type: "physical",
          title: title.trim() || "Untitled junk",
          summary: summary.trim() || "Something that can sit on a folding table.",
          hubId,
          price: money(cents),
          condition: condition.trim() || "Tested, kinda",
          cartEligible: true,
          status: "available",
        };

  const aisle = hubById(type === "digital" ? "download-stall" : hubId);

  return (
    <form
      action={sellListPath()}
      method="post"
      onSubmit={(event) => {
        if (type === "digital" && isGiftFileFormat(fileFormat)) {
          event.preventDefault();
          setGiftError(
            "The mall already sells one gift card. List a file — PDF, WAV, OTF.",
          );
        }
      }}
      className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
    >
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="stallId" value={stall.id} />

      <div className="space-y-6">
        <div className="rounded-xl bg-card/80 p-4 ring-1 ring-foreground/10">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Already picked
          </p>
          <p className="mt-1 font-heading text-lg tracking-tight">
            {stall.boothName}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {type === "physical"
              ? "A thing you can hold. Condition is the listing."
              : "A file from this booth. Download Stall is the aisle."}
          </p>
        </div>

        {type === "physical" ? (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Aisle</legend>
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
                      className={cn(
                        "w-full rounded-xl px-4 py-3 text-left ring-1 transition-shadow",
                        selected
                          ? "bg-card ring-2 ring-foreground"
                          : "bg-card/50 ring-foreground/10 hover:ring-foreground/20",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-heading text-lg tracking-tight">
                          {hub.name}
                        </p>
                        {selected ? (
                          <Badge variant="secondary">This aisle</Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {hub.rule}
                      </p>
                    </button>
                  );
                })}
            </div>
          </fieldset>
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
              Digital listings sit here. The stall is still {stall.boothName}.
              Not a second gift card.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={
              type === "physical"
                ? "Wobbly lamp, shade optional"
                : "How to price your junk (PDF)"
            }
            autoComplete="off"
            required
          />
          <p className="text-sm leading-6 text-muted-foreground">
            Gray example text is not the tag. Type the name.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">What it is</Label>
          <Textarea
            id="summary"
            name="summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder={
              type === "physical"
                ? "Lights up if you twist the neck. Box is tired."
                : "One page. A rule of thumb. Written on a folding table."
            }
            autoComplete="off"
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
              value={price}
              onChange={(event) => setPrice(event.target.value || "8")}
              required
            />
            <p className="text-sm leading-6 text-muted-foreground">
              The mall keeps 10% from this price, not on top of the buyer.
            </p>
          </div>
          {type === "physical" ? (
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Input
                id="condition"
                name="condition"
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
                placeholder="Has a crack, still lights up"
                autoComplete="off"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="fileFormat">File format</Label>
              <Input
                id="fileFormat"
                name="fileFormat"
                value={fileFormat}
                onChange={(event) => {
                  const value = event.target.value || "PDF";
                  setFileFormat(value);
                  if (!isGiftFileFormat(value)) {
                    setGiftError(null);
                  }
                }}
                placeholder="PDF"
                autoComplete="off"
                required
              />
            </div>
          )}
        </div>

        {giftError ? (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-[oklch(0.97_0.02_25)] px-4 py-3 text-sm leading-6 text-foreground"
          >
            {giftError}
          </p>
        ) : null}

        <button
          type="submit"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 w-full rounded-full px-5 sm:w-auto",
          )}
        >
          Put it on the table
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
          {type === "physical"
            ? `Condition: ${preview.type === "physical" ? preview.condition : ""}`
            : `Format: ${preview.type === "digital" ? preview.fileFormat : ""}`}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          Lives on {stall.boothName}. Same stall as whatever else is already
          there.
        </p>
      </aside>
    </form>
  );
}
