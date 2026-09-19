import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_SLIPMAT_NOTE_MAX,
  BOOTH_SLIPMAT_PAPER_LINE,
  stallSlipmatPath,
  stallSlipmatWritePath,
  type BoothSlipmatNote,
} from "@/lib/booth-slipmat";
import { cn } from "@/lib/utils";

export function BoothSlipmatForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothSlipmatNote;
}) {
  const slipmatPath = stallSlipmatPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallSlipmatWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={slipmatPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-slipmat-note">I don&apos;t have a slipmat?</Label>
          <Textarea
            id="booth-slipmat-note"
            name="note"
            rows={3}
            maxLength={BOOTH_SLIPMAT_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a slipmat. Still a crate. Still no deck."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the slipmat note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_SLIPMAT_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallSlipmatWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={slipmatPath} />
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
