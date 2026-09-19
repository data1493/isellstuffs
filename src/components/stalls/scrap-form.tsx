import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { stallScrapTapePath } from "@/lib/paths";
import { STALL_SCRAP_NOTE_MAX } from "@/lib/stall-scrap";
import { cn } from "@/lib/utils";

export function ScrapForm({ slug }: { slug: string }) {
  return (
    <form
      method="post"
      action={stallScrapTapePath(slug)}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="stall-scrap-note">Sticky for this table</Label>
        <textarea
          id="stall-scrap-note"
          name="note"
          rows={3}
          maxLength={STALL_SCRAP_NOTE_MAX}
          autoComplete="off"
          placeholder="cash only after 2"
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
        A sticky on this booth. Not a hunt. Not an offer on a lamp.
      </p>
    </form>
  );
}
