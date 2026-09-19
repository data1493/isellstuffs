import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_POSE_NOTE_MAX,
  BOOTH_POSE_PAPER_LINE,
  stallPosePath,
  stallPoseWritePath,
  type BoothPoseNote,
} from "@/lib/booth-pose";
import { cn } from "@/lib/utils";

export function BoothPoseForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothPoseNote;
}) {
  const posePath = stallPosePath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallPoseWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={posePath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-pose-note">Nothing with a lookbook?</Label>
          <Textarea
            id="booth-pose-note"
            name="note"
            rows={3}
            maxLength={BOOTH_POSE_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="Nothing with a lookbook. Clothes had a season."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the lookbook note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_POSE_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallPoseWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={posePath} />
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
