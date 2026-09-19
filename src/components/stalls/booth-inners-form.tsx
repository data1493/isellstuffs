import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_INNERS_NOTE_MAX,
  BOOTH_INNERS_PAPER_LINE,
  stallInnersPath,
  stallInnersWritePath,
  type BoothInnersNote,
} from "@/lib/booth-inners";
import { cn } from "@/lib/utils";

export function BoothInnersForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothInnersNote;
}) {
  const innersPath = stallInnersPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallInnersWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={innersPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-inners-note">I don&apos;t have inners?</Label>
          <Textarea
            id="booth-inners-note"
            name="note"
            rows={3}
            maxLength={BOOTH_INNERS_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have inners. Grocery bag."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the inners note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_INNERS_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallInnersWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={innersPath} />
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
