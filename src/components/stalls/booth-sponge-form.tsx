import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_SPONGE_NOTE_MAX,
  BOOTH_SPONGE_PAPER_LINE,
  stallSpongePath,
  stallSpongeWritePath,
  type BoothSpongeNote,
} from "@/lib/booth-sponge";
import { cn } from "@/lib/utils";

export function BoothSpongeForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothSpongeNote;
}) {
  const spongePath = stallSpongePath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallSpongeWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={spongePath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-sponge-note">I don&apos;t have a sponge?</Label>
          <Textarea
            id="booth-sponge-note"
            name="note"
            rows={3}
            maxLength={BOOTH_SPONGE_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a sponge. Still dishes. Still a hose."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the sponge note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_SPONGE_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallSpongeWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={spongePath} />
          <button
            type="submit"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 w-full rounded-full",
            )}
          >
            Clear this booth
          </button>
        </form>
      ) : null}
    </div>
  );
}
