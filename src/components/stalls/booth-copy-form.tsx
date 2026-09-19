import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_COPY_NOTE_MAX,
  BOOTH_COPY_PAPER_LINE,
  stallCopyPath,
  stallCopyWritePath,
  type BoothCopyNote,
} from "@/lib/booth-copy";
import { cn } from "@/lib/utils";

export function BoothCopyForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothCopyNote;
}) {
  const copyPath = stallCopyPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallCopyWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={copyPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-copy-note">I will not copy onto your stick?</Label>
          <Textarea
            id="booth-copy-note"
            name="note"
            rows={3}
            maxLength={BOOTH_COPY_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I will not copy onto your stick. Folder after pay."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the copy note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_COPY_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallCopyWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={copyPath} />
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
