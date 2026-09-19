import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { adKindCopy } from "@/lib/ads-display";
import { type NextWindowPackage } from "@/lib/ad-booking";
import { formatMoney, mallHubs } from "@/lib/commerce";
import { advertiseBookPayPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

const errorCopy = {
  name: "Name the stall that is buying the light.",
  hub: "Pick a hub on the map.",
  pay: "Could not book the corner. Try the desk again.",
} as const;

export function BookForm({
  pack,
  error,
}: {
  pack: NextWindowPackage;
  error?: string;
}) {
  const kind = adKindCopy[pack.kind];
  const needsHub = pack.kind === "hub-takeover";
  const message =
    error && error in errorCopy
      ? errorCopy[error as keyof typeof errorCopy]
      : null;

  return (
    <form
      method="post"
      action={advertiseBookPayPath()}
      className="space-y-6"
    >
      <input type="hidden" name="kind" value={pack.kind} />

      <fieldset className="space-y-3">
        <legend className="font-heading text-xl tracking-tight">The booth</legend>
        <div className="space-y-1.5">
          <Label htmlFor="stall-name">Booth name</Label>
          <input
            id="stall-name"
            name="stallName"
            autoComplete="organization"
            required
            minLength={2}
            placeholder="Tape Drawer Saturday"
            className="h-11 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          />
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          {kind.product}. The placement will be labeled. There is no stealth
          checkbox — if you cannot say you bought it, you cannot sit there.
        </p>
      </fieldset>

      {needsHub ? (
        <fieldset className="space-y-3">
          <legend className="font-heading text-xl tracking-tight">Which aisle</legend>
          <p className="text-sm leading-6 text-muted-foreground">
            Hubs on the map. The rule stays. You buy the hero, not a rewrite.
          </p>
          <div className="grid gap-2">
            {mallHubs.map((hub) => (
              <label
                key={hub.id}
                className="flex cursor-pointer items-start gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/10 has-[:checked]:bg-secondary/60 has-[:checked]:ring-primary/30"
              >
                <input
                  type="radio"
                  name="hubId"
                  value={hub.id}
                  required
                  className="mt-1"
                />
                <span>
                  <span className="block font-medium">{hub.name}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                    {hub.rule}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {message ? (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Pay {formatMoney(pack.price)}
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          Local stand-in. No Stripe. No live charge. The receipt is the proof.
        </p>
      </div>
    </form>
  );
}
