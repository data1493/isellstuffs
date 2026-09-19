import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_DISHES_NOTE_MAX,
  BOOTH_DISHES_PAPER_LINE,
  stallDishesPath,
  stallDishesWritePath,
  type BoothDishesNote,
} from "@/lib/booth-dishes";
import { cn } from "@/lib/utils";

export function BoothDishesForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothDishesNote;
}) {
  const dishesPath = stallDishesPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallDishesWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={dishesPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-dishes-note">I don&apos;t do dishes?</Label>
          <Textarea
            id="booth-dishes-note"
            name="note"
            rows={3}
            maxLength={BOOTH_DISHES_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't do dishes. Chip stays."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the dishes note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_DISHES_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallDishesWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={dishesPath} />
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
