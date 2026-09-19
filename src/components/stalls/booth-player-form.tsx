import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_PLAYER_NOTE_MAX,
  BOOTH_PLAYER_PAPER_LINE,
  stallPlayerPath,
  stallPlayerWritePath,
  type BoothPlayerNote,
} from "@/lib/booth-player";
import { cn } from "@/lib/utils";

export function BoothPlayerForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothPlayerNote;
}) {
  const playerPath = stallPlayerPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallPlayerWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={playerPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-player-note">I don&apos;t have a player?</Label>
          <Textarea
            id="booth-player-note"
            name="note"
            rows={3}
            maxLength={BOOTH_PLAYER_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a player. Still Sharpie."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the player note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_PLAYER_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallPlayerWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={playerPath} />
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
