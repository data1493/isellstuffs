import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_PONY_NOTE_MAX,
  BOOTH_PONY_PAPER_LINE,
  stallPonyPath,
  stallPonyWritePath,
  type BoothPonyNote,
} from "@/lib/booth-pony";
import { cn } from "@/lib/utils";

export function BoothPonyForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothPonyNote;
}) {
  const ponyPath = stallPonyPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallPonyWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={ponyPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-pony-note">I don&apos;t have a pony?</Label>
          <Textarea
            id="booth-pony-note"
            name="note"
            rows={3}
            maxLength={BOOTH_PONY_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a pony. Still a closet."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the pony note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_PONY_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallPonyWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={ponyPath} />
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
