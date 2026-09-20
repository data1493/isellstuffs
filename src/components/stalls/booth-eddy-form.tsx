import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_EDDY_NOTE_MAX,
  BOOTH_EDDY_PAPER_LINE,
  stallEddyPath,
  stallEddyWritePath,
  type BoothEddyNote,
} from "@/lib/booth-eddy";
import { cn } from "@/lib/utils";

export function BoothEddyForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothEddyNote;
}) {
  const eddyPath = stallEddyPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallEddyWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={eddyPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-eddy-note">I don&apos;t have an eddy?</Label>
          <Textarea
            id="booth-eddy-note"
            name="note"
            rows={3}
            maxLength={BOOTH_EDDY_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have an eddy. Still a crate."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the eddy note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_EDDY_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallEddyWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={eddyPath} />
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
