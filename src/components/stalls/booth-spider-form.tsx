import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_SPIDER_NOTE_MAX,
  BOOTH_SPIDER_PAPER_LINE,
  stallSpiderPath,
  stallSpiderWritePath,
  type BoothSpiderNote,
} from "@/lib/booth-spider";
import { cn } from "@/lib/utils";

export function BoothSpiderForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothSpiderNote;
}) {
  const spiderPath = stallSpiderPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallSpiderWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={spiderPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-spider-note">I don&apos;t have a spider?</Label>
          <Textarea
            id="booth-spider-note"
            name="note"
            rows={3}
            maxLength={BOOTH_SPIDER_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a spider. Still Side A."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the spider note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_SPIDER_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallSpiderWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={spiderPath} />
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
