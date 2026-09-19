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
  stalls,
  type HubId,
  type Listing,
  type ListingType,
} from "@/lib/commerce";
import { sellListPath } from "@/lib/paths";
import { isPhysicalHubId } from "@/lib/seller-listing";
import { cn } from "@/lib/utils";

const typeOptions: Array<{
  id: ListingType;
  title: string;
  body: string;
}> = [
  {
    id: "physical",
    title: "Physical",
    body: "Something you can hold. Condition is the listing.",
  },
  {
    id: "digital",
    title: "Digital",
    body: "A file from the same stall. Format stands in for condition.",
  },
];

function dollarsToCents(value: string) {
  const dollars = Number(value);
  if (!Number.isFinite(dollars) || dollars <= 0) {
    return 0;
  }
  return Math.round(dollars * 100);
}

function fieldValue(target: EventTarget | null) {
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
    return "";
  }
  return target.value;
}

export function ListingForm({ error }: { error?: string }) {
  const [type, setType] = useState<ListingType>("physical");
  const [hubId, setHubId] = useState<HubId>("yard-sale");
  const [stallId, setStallId] = useState<string>(stalls[0].id);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [price, setPrice] = useState("7");
  const [condition, setCondition] = useState("");
  const [fileFormat, setFileFormat] = useState("PDF");

  const cents = dollarsToCents(price) || 700;
  const preview: Listing =
    type === "digital"
      ? {
          id: "preview",
          stallId,
          type: "digital",
          title: title || "Untitled file",
          summary: summary || "A file from this stall.",
          hubId: "download-stall",
          price: money(cents),
          fileFormat: fileFormat || "PDF",
          cartEligible: true,
          status: "available",
        }
      : {
          id: "preview",
          stallId,
          type: "physical",
          title: title || "Untitled junk",
          summary: summary || "Something that can sit on a folding table.",
          hubId,
          price: money(cents),
          condition: condition || "Tested, kinda",
          cartEligible: true,
          status: "available",
        };

  const stall = stalls.find((item) => item.id === stallId);
  const aisle = hubById(type === "digital" ? "download-stall" : hubId);

  return (
    <form
      action={sellListPath()}
      method="post"
      className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
    >
      <div className="space-y-6">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">What kind of thing?</legend>
          <input type="hidden" name="type" value={type} />
          <div className="grid gap-2 sm:grid-cols-2">
            {typeOptions.map((option) => {
              const selected = type === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setType(option.id);
                    if (option.id === "digital") {
                      setHubId("download-stall");
                    } else if (hubId === "download-stall") {
                      setHubId("yard-sale");
                    }
                  }}
                  className={`rounded-xl px-4 py-3 text-left ring-1 transition-shadow ${
                    selected
                      ? "bg-card ring-foreground/20"
                      : "bg-card/50 ring-foreground/10 hover:ring-foreground/20"
                  }`}
                >
                  <p className="font-heading text-lg tracking-tight">{option.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {option.body}
                  </p>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="stallId">Stall</Label>
          <select
            id="stallId"
            name="stallId"
            defaultValue={stalls[0].id}
            onChange={(event) => setStallId(event.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {stalls.map((item) => (
              <option key={item.id} value={item.id}>
                {item.boothName}
              </option>
            ))}
          </select>
          <p className="text-sm leading-6 text-muted-foreground">
            One booth. A jacket and a zip can share it. You are adding to a
            stall, not opening a second shop.
          </p>
        </div>

        {type === "physical" ? (
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
                      className={`rounded-xl px-4 py-3 text-left ring-1 transition-shadow ${
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
              Digital listings sit in this aisle. The stall is still the same
              booth as the junk on the table.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue=""
            onInput={(event) => setTitle(fieldValue(event.target))}
            placeholder={
              type === "physical"
                ? "Wobbly lamp, shade optional"
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
            defaultValue=""
            onInput={(event) => setSummary(fieldValue(event.target))}
            placeholder={
              type === "physical"
                ? "Lights up if you twist the neck. Box is tired."
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
              defaultValue="7"
              onInput={(event) => setPrice(fieldValue(event.target) || "7")}
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
                defaultValue=""
                onInput={(event) => setCondition(fieldValue(event.target))}
                placeholder="Has a crack, still lights up"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="fileFormat">File format</Label>
              <Input
                id="fileFormat"
                name="fileFormat"
                defaultValue="PDF"
                onInput={(event) => setFileFormat(fieldValue(event.target) || "PDF")}
                placeholder="PDF"
                required
              />
            </div>
          )}
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-[oklch(0.97_0.02_25)] px-4 py-3 text-sm leading-6 text-foreground"
          >
            {error}
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
          {stall
            ? `Lives on ${stall.boothName}. Same stall as whatever else is already there.`
            : "Pick a stall."}
        </p>
      </aside>
    </form>
  );
}
