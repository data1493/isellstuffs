import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_CRADLE_NOTE_MAX,
  BOOTH_CRADLE_PAPER_LINE,
  stallCradlePath,
  stallCradleWritePath,
  type BoothCradleNote,
} from "@/lib/booth-cradle";
import { cn } from "@/lib/utils";

export function BoothCradleForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothCradleNote;
}) {
  const cradlePath = stallCradlePath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallCradleWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={cradlePath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-cradle-note">I don&apos;t have a cradle?</Label>
          <Textarea
            id="booth-cradle-note"
            name="note"
            rows={3}
            maxLength={BOOTH_CRADLE_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a cradle. Still a crate. Still a skip."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the cradle note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_CRADLE_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallCradleWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={cradlePath} />
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
