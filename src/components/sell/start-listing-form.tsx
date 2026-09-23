import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { physicalHubs, type ListingType, type Stall } from "@/lib/commerce";
import { sellListPath } from "@/lib/paths";
import { digitalAisleCopy } from "@/lib/sell-start";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-11 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

const areaClass =
  "min-h-28 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

export function StartListingForm({
  stall,
  type,
}: {
  stall: Stall;
  type: ListingType;
}) {
  const physical = type === "physical";

  return (
    <form
      action={sellListPath()}
      method="post"
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
            {physical
              ? "A thing you can hold. Condition is the listing."
              : digitalAisleCopy()}
          </p>
        </div>

        {physical ? (
          <div className="space-y-2">
            <Label htmlFor="hubId">Aisle</Label>
            <select
              id="hubId"
              name="hubId"
              defaultValue="yard-sale"
              required
              className={fieldClass}
            >
              {physicalHubs().map((hub) => (
                <option key={hub.id} value={hub.id}>
                  {hub.name} — {hub.rule}
                </option>
              ))}
            </select>
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
              Files sit here. The stall is still {stall.boothName}. Not a
              second gift card.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder={
              physical
                ? "Wobbly lamp, shade optional"
                : "How to price your junk (PDF)"
            }
            autoComplete="off"
            required
            className={fieldClass}
          />
          <p className="text-sm leading-6 text-muted-foreground">
            Gray example text is not the tag. Type the name.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">What it is</Label>
          <textarea
            id="summary"
            name="summary"
            placeholder={
              physical
                ? "Lights up if you twist the neck. Box is tired."
                : "One page. A rule of thumb. Written on a folding table."
            }
            autoComplete="off"
            required
            className={areaClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <input
              id="price"
              name="price"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              defaultValue="8"
              required
              className={fieldClass}
            />
            <p className="text-sm leading-6 text-muted-foreground">
              The mall keeps 10% from this price, not on top of the buyer.
            </p>
          </div>
          {physical ? (
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <input
                id="condition"
                name="condition"
                type="text"
                placeholder="Has a crack, still lights up"
                autoComplete="off"
                required
                className={fieldClass}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="fileFormat">File format</Label>
              <input
                id="fileFormat"
                name="fileFormat"
                type="text"
                defaultValue="PDF"
                placeholder="PDF"
                autoComplete="off"
                required
                className={fieldClass}
              />
              <p className="text-sm leading-6 text-muted-foreground">
                A file type. Not GIFT — the mall already sells one card.
              </p>
            </div>
          )}
        </div>

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

      <aside className="space-y-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 lg:self-start">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          This posts to the table
        </p>
        <p className="font-heading text-2xl tracking-tight">{stall.boothName}</p>
        <p className="text-sm leading-6 text-muted-foreground">
          {physical
            ? "Physical. Same fields as the dump form. Native POST to /sell/list."
            : "Digital. Aisle is Download Stall. Same POST as /sell/new."}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          You land on the booth. The desk picks the SKU up from the overlay the
          mall already reads.
        </p>
      </aside>
    </form>
  );
}
