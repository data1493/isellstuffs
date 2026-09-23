import { buttonVariants } from "@/components/ui/button";
import { stallSharePath, stallShareWritePath } from "@/lib/paths";
import {
  TABLE_SHARE_PAPER_LINE,
  sharePartnerStalls,
  type TableShare,
} from "@/lib/table-share";
import { cn } from "@/lib/utils";

export function TableShareForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: TableShare;
}) {
  const share = stallSharePath(slug);
  const partners = sharePartnerStalls(stallId);

  return (
    <div className="space-y-4">
      <form method="post" action={stallShareWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={share} />
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Who is sharing?</legend>
          <p className="text-sm leading-6 text-muted-foreground">
            A real catalog booth. Not this table. SKUs stay with their stall.
          </p>
          <div className="grid gap-2">
            {partners.map((partner) => (
              <label
                key={partner.id}
                className="flex cursor-pointer items-start gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/10 has-[:checked]:bg-secondary/60 has-[:checked]:ring-primary/30"
              >
                <input
                  type="radio"
                  name="sharerId"
                  value={partner.id}
                  defaultChecked={current?.sharerId === partner.id}
                  className="mt-1 size-4 shrink-0 accent-foreground"
                />
                <span>
                  <span className="block font-medium">{partner.boothName}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                    {partner.blurb}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the sharer
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {TABLE_SHARE_PAPER_LINE} Not a seventh stall.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallShareWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="sharerId" value="" />
          <input type="hidden" name="returnTo" value={share} />
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
