import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_RICER_NOTE_MAX,
  BOOTH_RICER_PAPER_LINE,
  stallRicerPath,
  stallRicerWritePath,
  type BoothRicerNote,
} from "@/lib/booth-ricer";
import { cn } from "@/lib/utils";

export function BoothRicerForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothRicerNote;
}) {
  const ricerPath = stallRicerPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallRicerWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={ricerPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-ricer-note">I don&apos;t have a ricer?</Label>
          <Textarea
            id="booth-ricer-note"
            name="note"
            rows={3}
            maxLength={BOOTH_RICER_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a ricer. Still a drawer."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the ricer note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_RICER_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallRicerWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={ricerPath} />
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
