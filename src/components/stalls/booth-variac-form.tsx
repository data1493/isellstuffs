import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_VARIAC_NOTE_MAX,
  BOOTH_VARIAC_PAPER_LINE,
  stallVariacPath,
  stallVariacWritePath,
  type BoothVariacNote,
} from "@/lib/booth-variac";
import { cn } from "@/lib/utils";

export function BoothVariacForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothVariacNote;
}) {
  const variacPath = stallVariacPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallVariacWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={variacPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-variac-note">I don&apos;t have a variac?</Label>
          <Textarea
            id="booth-variac-note"
            name="note"
            rows={3}
            maxLength={BOOTH_VARIAC_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a variac. Still a driveway. Still no bench."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the variac note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_VARIAC_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallVariacWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={variacPath} />
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
