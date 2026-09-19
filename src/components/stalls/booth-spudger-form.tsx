import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_SPUDGER_NOTE_MAX,
  BOOTH_SPUDGER_PAPER_LINE,
  stallSpudgerPath,
  stallSpudgerWritePath,
  type BoothSpudgerNote,
} from "@/lib/booth-spudger";
import { cn } from "@/lib/utils";

export function BoothSpudgerForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothSpudgerNote;
}) {
  const spudgerPath = stallSpudgerPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallSpudgerWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={spudgerPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-spudger-note">I don&apos;t have a spudger?</Label>
          <Textarea
            id="booth-spudger-note"
            name="note"
            rows={3}
            maxLength={BOOTH_SPUDGER_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a spudger. Still a blister. Still fused."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the spudger note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_SPUDGER_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallSpudgerWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={spudgerPath} />
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
