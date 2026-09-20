import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_HEADSHELL_NOTE_MAX,
  BOOTH_HEADSHELL_PAPER_LINE,
  stallHeadshellPath,
  stallHeadshellWritePath,
  type BoothHeadshellNote,
} from "@/lib/booth-headshell";
import { cn } from "@/lib/utils";

export function BoothHeadshellForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothHeadshellNote;
}) {
  const headshellPath = stallHeadshellPath(slug);

  return (
    <div className="space-y-4">
      <form
        method="post"
        action={stallHeadshellWritePath()}
        className="space-y-4"
      >
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={headshellPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-headshell-note">
            I don&apos;t have a headshell?
          </Label>
          <Textarea
            id="booth-headshell-note"
            name="note"
            rows={3}
            maxLength={BOOTH_HEADSHELL_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a headshell. Still a crate. Still a skip."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the headshell note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_HEADSHELL_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallHeadshellWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={headshellPath} />
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
