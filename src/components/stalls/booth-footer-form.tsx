import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_FOOTER_NOTE_MAX,
  BOOTH_FOOTER_PAPER_LINE,
  stallFooterPath,
  stallFooterWritePath,
  type BoothFooterNote,
} from "@/lib/booth-footer";
import { cn } from "@/lib/utils";

export function BoothFooterForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothFooterNote;
}) {
  const footerPath = stallFooterPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallFooterWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={footerPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-footer-note">I don&apos;t have a footer?</Label>
          <Textarea
            id="booth-footer-note"
            name="note"
            rows={3}
            maxLength={BOOTH_FOOTER_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a footer. Still a crate. Still a skip."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the footer note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_FOOTER_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallFooterWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={footerPath} />
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
