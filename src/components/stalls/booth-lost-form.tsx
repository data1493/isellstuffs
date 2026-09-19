import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BOOTH_LOST_NOTE_MAX } from "@/lib/booth-lost";
import { stallLostWritePath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function BoothLostForm({ slug }: { slug: string }) {
  return (
    <form
      method="post"
      action={stallLostWritePath()}
      className="space-y-4"
    >
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="intent" value="tape" />
      <div className="space-y-1.5">
        <Label htmlFor="booth-lost-title">What was left behind</Label>
        <textarea
          id="booth-lost-title"
          name="title"
          rows={3}
          maxLength={BOOTH_LOST_NOTE_MAX}
          autoComplete="off"
          placeholder="green sunglasses"
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
        Left behind on this booth. Not free. Not cork.
      </p>
    </form>
  );
}
