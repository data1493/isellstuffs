import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_FUNNEL_NOTE_MAX,
  BOOTH_FUNNEL_PAPER_LINE,
  stallFunnelPath,
  stallFunnelWritePath,
  type BoothFunnelNote,
} from "@/lib/booth-funnel";
import { cn } from "@/lib/utils";

export function BoothFunnelForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothFunnelNote;
}) {
  const funnelPath = stallFunnelPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallFunnelWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={funnelPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-funnel-note">I don&apos;t have a funnel?</Label>
          <Textarea
            id="booth-funnel-note"
            name="note"
            rows={3}
            maxLength={BOOTH_FUNNEL_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a funnel. Still a drawer. Still a table."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the funnel note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_FUNNEL_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallFunnelWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={funnelPath} />
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
