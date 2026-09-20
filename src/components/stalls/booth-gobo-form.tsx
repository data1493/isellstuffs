import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_GOBO_NOTE_MAX,
  BOOTH_GOBO_PAPER_LINE,
  stallGoboPath,
  stallGoboWritePath,
  type BoothGoboNote,
} from "@/lib/booth-gobo";
import { cn } from "@/lib/utils";

export function BoothGoboForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothGoboNote;
}) {
  const goboPath = stallGoboPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallGoboWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={goboPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-gobo-note">I don&apos;t have a gobo?</Label>
          <Textarea
            id="booth-gobo-note"
            name="note"
            rows={3}
            maxLength={BOOTH_GOBO_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a gobo. Still a folder. Still a jewel case."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the gobo note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_GOBO_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallGoboWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={goboPath} />
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
