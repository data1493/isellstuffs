import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_CLAIM_NOTE_MAX,
  BOOTH_CLAIM_PAPER_LINE,
  stallClaimPath,
  stallClaimWritePath,
  type BoothClaimNote,
} from "@/lib/booth-claim";
import { cn } from "@/lib/utils";

export function BoothClaimForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothClaimNote;
}) {
  const claimPath = stallClaimPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallClaimWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={claimPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-claim-note">I don&apos;t warranty?</Label>
          <Textarea
            id="booth-claim-note"
            name="note"
            rows={3}
            maxLength={BOOTH_CLAIM_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't warranty. Tested, kinda."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the claim note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_CLAIM_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallClaimWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={claimPath} />
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
