import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_STROP_NOTE_MAX,
  BOOTH_STROP_PAPER_LINE,
  stallStropPath,
  stallStropWritePath,
  type BoothStropNote,
} from "@/lib/booth-strop";
import { cn } from "@/lib/utils";

export function BoothStropForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothStropNote;
}) {
  const stropPath = stallStropPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallStropWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={stropPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-strop-note">I don&apos;t have a strop?</Label>
          <Textarea
            id="booth-strop-note"
            name="note"
            rows={3}
            maxLength={BOOTH_STROP_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a strop. Still a crate. Still a skip."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the strop note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_STROP_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallStropWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={stropPath} />
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
