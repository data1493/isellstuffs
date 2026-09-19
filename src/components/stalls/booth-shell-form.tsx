import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_SHELL_NOTE_MAX,
  BOOTH_SHELL_PAPER_LINE,
  stallShellPath,
  stallShellWritePath,
  type BoothShellNote,
} from "@/lib/booth-shell";
import { cn } from "@/lib/utils";

export function BoothShellForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothShellNote;
}) {
  const shellPath = stallShellPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallShellWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={shellPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-shell-note">What stays sealed?</Label>
          <Textarea
            id="booth-shell-note"
            name="note"
            rows={3}
            maxLength={BOOTH_SHELL_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="don't open the shell"
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the shell
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_SHELL_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallShellWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={shellPath} />
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
