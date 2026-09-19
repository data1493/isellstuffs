import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BOOTH_BUYS_NOTE_MAX } from "@/lib/booth-buys";
import { stallBuyWritePath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function BoothBuysForm({ slug }: { slug: string }) {
  return (
    <form
      method="post"
      action={stallBuyWritePath()}
      className="space-y-4"
    >
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="intent" value="tape" />
      <div className="space-y-1.5">
        <Label htmlFor="booth-buy-title">What this booth buys</Label>
        <textarea
          id="booth-buy-title"
          name="title"
          rows={3}
          maxLength={BOOTH_BUYS_NOTE_MAX}
          autoComplete="off"
          placeholder="scratched LPs"
          className="min-h-24 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      <button
        type="submit"
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
      >
        Tape it
      </button>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        This booth also buys. Wanted is walkers. Scrap is a lid question.
      </p>
    </form>
  );
}
