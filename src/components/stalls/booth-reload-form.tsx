import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_RELOAD_NOTE_MAX,
  BOOTH_RELOAD_PAPER_LINE,
  stallReloadPath,
  stallReloadWritePath,
  type BoothReloadNote,
} from "@/lib/booth-reload";
import { cn } from "@/lib/utils";

export function BoothReloadForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothReloadNote;
}) {
  const reloadPath = stallReloadPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallReloadWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={reloadPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-reload-note">I don&apos;t reload?</Label>
          <Textarea
            id="booth-reload-note"
            name="note"
            rows={3}
            maxLength={BOOTH_RELOAD_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't reload. Face value."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the reload note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_RELOAD_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallReloadWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={reloadPath} />
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
