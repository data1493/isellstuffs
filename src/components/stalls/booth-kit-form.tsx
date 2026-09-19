import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_KIT_NOTE_MAX,
  BOOTH_KIT_PAPER_LINE,
  stallKitPath,
  stallKitWritePath,
  type BoothKitNote,
} from "@/lib/booth-kit";
import { cn } from "@/lib/utils";

export function BoothKitForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothKitNote;
}) {
  const kitPath = stallKitPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallKitWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={kitPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-kit-note">I don&apos;t assemble?</Label>
          <Textarea
            id="booth-kit-note"
            name="note"
            rows={3}
            maxLength={BOOTH_KIT_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't assemble. Shade stays in the box."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the kit note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_KIT_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallKitWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={kitPath} />
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
