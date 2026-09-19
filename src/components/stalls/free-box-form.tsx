import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FREE_BOX_NOTE_MAX } from "@/lib/free-box";
import { stallFreeWritePath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function FreeBoxForm({ slug }: { slug: string }) {
  return (
    <form
      method="post"
      action={stallFreeWritePath()}
      className="space-y-4"
    >
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="intent" value="tape" />
      <div className="space-y-1.5">
        <Label htmlFor="free-box-title">Title for this pile</Label>
        <textarea
          id="free-box-title"
          name="title"
          rows={3}
          maxLength={FREE_BOX_NOTE_MAX}
          autoComplete="off"
          placeholder="extra plastic hangers"
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
        A cardboard title on this booth. Not a $0 listing. Not tote math.
      </p>
    </form>
  );
}
