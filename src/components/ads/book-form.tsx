"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adKindCopy } from "@/lib/ads-display";
import {
  createAdBooking,
  writeAdBooking,
  type NextWindowPackage,
} from "@/lib/ad-booking";
import { formatMoney, mallHubs, type HubId } from "@/lib/commerce";
import { advertiseReceiptPath } from "@/lib/paths";

export function BookForm({ pack }: { pack: NextWindowPackage }) {
  const router = useRouter();
  const kind = adKindCopy[pack.kind];
  const needsHub = pack.kind === "hub-takeover";
  const [stallName, setStallName] = useState("");
  const [hubId, setHubId] = useState<HubId | "">("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    const name = stallName.trim();
    if (name.length < 2) {
      setError("Name the stall that is buying the light.");
      return;
    }
    if (needsHub && !hubId) {
      setError("Pick a hub on the map.");
      return;
    }

    setBusy(true);
    try {
      const booking = createAdBooking({
        kind: pack.kind,
        stallName: name,
        ...(needsHub && hubId ? { hubId } : {}),
      });
      writeAdBooking(booking);
      router.push(advertiseReceiptPath(booking.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not book the corner.");
      setBusy(false);
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <fieldset className="space-y-3">
        <legend className="font-heading text-xl tracking-tight">The booth</legend>
        <div className="space-y-1.5">
          <Label htmlFor="stall-name">Booth name</Label>
          <Input
            id="stall-name"
            name="stallName"
            autoComplete="organization"
            required
            placeholder="Tape Drawer Saturday"
            value={stallName}
            onChange={(event) => setStallName(event.target.value)}
            className="h-11 bg-background"
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
            {mallHubs.map((hub) => {
              const selected = hubId === hub.id;
              return (
                <label
                  key={hub.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl px-4 py-3 ring-1 ${
                    selected
                      ? "bg-secondary/60 ring-primary/30"
                      : "bg-card ring-foreground/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="hubId"
                    value={hub.id}
                    checked={selected}
                    onChange={() => setHubId(hub.id)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-medium">{hub.name}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                      {hub.rule}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <Button
          type="submit"
          size="lg"
          className="h-11 w-full rounded-full"
          disabled={busy}
        >
          {busy ? "Stamping the slip…" : `Pay ${formatMoney(pack.price)}`}
        </Button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          Local stand-in. No Stripe. No live charge. The receipt is the proof.
        </p>
      </div>
    </form>
  );
}
