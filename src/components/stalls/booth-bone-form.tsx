import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_BONE_NOTE_MAX,
  BOOTH_BONE_PAPER_LINE,
  stallBonePath,
  stallBoneWritePath,
  type BoothBoneNote,
} from "@/lib/booth-bone";
import { cn } from "@/lib/utils";

export function BoothBoneForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothBoneNote;
}) {
  const bonePath = stallBonePath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallBoneWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={bonePath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-bone-note">I don&apos;t have a bone?</Label>
          <Textarea
            id="booth-bone-note"
            name="note"
            rows={3}
            maxLength={BOOTH_BONE_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a bone. Still a driveway. Still a grocery bag."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the bone note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_BONE_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallBoneWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={bonePath} />
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
