"use client";

import { useState, useTransition } from "react";

import { saveStallCard } from "@/app/stalls/[slug]/edit/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Stall } from "@/lib/commerce";
import { parseStallCard } from "@/lib/stall-card";
import { upsertStallCard } from "@/lib/stall-overlay";

export function BoothCardForm({ stall }: { stall: Stall }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState(stall.boothName);
  const [previewBlurb, setPreviewBlurb] = useState(stall.blurb);

  function onSubmit(formData: FormData) {
    setError(null);
    const parsed = parseStallCard(formData);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }

    upsertStallCard(parsed.patch);
    startTransition(async () => {
      const result = await saveStallCard(formData);
      if (result && !result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <form
      action={onSubmit}
      className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
    >
      <div className="space-y-6">
        <input type="hidden" name="stallId" value={stall.id} />

        <div className="space-y-2">
          <Label htmlFor="boothName">Booth name</Label>
          <Input
            id="boothName"
            name="boothName"
            defaultValue={stall.boothName}
            onInput={(event) => setPreviewName(event.currentTarget.value)}
            placeholder="Folding Table Tuesday"
            autoComplete="organization"
            required
          />
          <p className="text-sm leading-6 text-muted-foreground">
            The slug stays {stall.slug}. You are rewriting the card, not
            moving the table.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="blurb">Pitch</Label>
          <Textarea
            id="blurb"
            name="blurb"
            defaultValue={stall.blurb}
            onInput={(event) => setPreviewBlurb(event.currentTarget.value)}
            placeholder="Whatever did not sell in the driveway last weekend."
            required
          />
          <p className="text-sm leading-6 text-muted-foreground">
            One breath. Shoppers read this on the stall page. Featured stays
            a fixture — you cannot buy the good corner from here.
          </p>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-[oklch(0.97_0.02_25)] px-4 py-3 text-sm leading-6 text-foreground"
          >
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="h-11 w-full rounded-full px-5 sm:w-auto"
        >
          {pending ? "Taping the card…" : "Tape the new card"}
        </Button>
      </div>

      <aside className="space-y-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 lg:sticky lg:top-28 lg:self-start">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Preview
        </p>
        <h2 className="font-heading text-2xl tracking-tight">
          {previewName.trim() || stall.boothName}
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          {previewBlurb.trim() || stall.blurb}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          Local overlay. No account. No database. Reload the stall and the
          shop already reads this card.
        </p>
      </aside>
    </form>
  );
}
