import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { wantedTapePath } from "@/lib/paths";
import { WANTED_NOTE_MAX } from "@/lib/wanted";
import { cn } from "@/lib/utils";

export function HuntForm() {
  return (
    <form method="post" action={wantedTapePath()} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="hunt-note">What are you hunting?</Label>
        <textarea
          id="hunt-note"
          name="note"
          rows={3}
          maxLength={WANTED_NOTE_MAX}
          autoComplete="off"
          placeholder="I need a diner mug"
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
        A scrap on the cork. Not a listing. Sellers still tape a stall.
      </p>
    </form>
  );
}
