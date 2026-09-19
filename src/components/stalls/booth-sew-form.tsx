import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_SEW_NOTE_MAX,
  BOOTH_SEW_PAPER_LINE,
  stallSewPath,
  stallSewWritePath,
  type BoothSewNote,
} from "@/lib/booth-sew";
import { cn } from "@/lib/utils";

export function BoothSewForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothSewNote;
}) {
  const sewPath = stallSewPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallSewWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={sewPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-sew-note">I don&apos;t sew?</Label>
          <Textarea
            id="booth-sew-note"
            name="note"
            rows={3}
            maxLength={BOOTH_SEW_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't sew. I don't hem it. Take it as-is."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the sew note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_SEW_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallSewWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={sewPath} />
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
