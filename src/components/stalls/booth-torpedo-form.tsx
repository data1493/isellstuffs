import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_TORPEDO_NOTE_MAX,
  BOOTH_TORPEDO_PAPER_LINE,
  stallTorpedoPath,
  stallTorpedoWritePath,
  type BoothTorpedoNote,
} from "@/lib/booth-torpedo";
import { cn } from "@/lib/utils";

export function BoothTorpedoForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothTorpedoNote;
}) {
  const torpedoPath = stallTorpedoPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallTorpedoWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={torpedoPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-torpedo-note">I don&apos;t have a torpedo?</Label>
          <Textarea
            id="booth-torpedo-note"
            name="note"
            rows={3}
            maxLength={BOOTH_TORPEDO_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a torpedo. Still a crack. Still a stain."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the torpedo note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_TORPEDO_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallTorpedoWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={torpedoPath} />
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
