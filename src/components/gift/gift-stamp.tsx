import { Badge } from "@/components/ui/badge";
import {
  GIFT_STAMP_COPY,
  giftCreditLabel,
  type GiftCredit,
} from "@/lib/gift-desk";

export function GiftStamp({ credit }: { credit: GiftCredit }) {
  return (
    <article
      className="w-full rounded-2xl border-2 border-dashed border-primary/35 bg-card px-5 py-8 text-center ring-1 ring-primary/10 sm:px-8"
      aria-label={GIFT_STAMP_COPY}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant="secondary" className="rounded-full">
          On paper
        </Badge>
        <Badge variant="outline" className="rounded-full">
          Not a tote coupon
        </Badge>
      </div>
      <p className="mt-5 font-heading text-3xl tracking-tight text-balance sm:text-4xl">
        {GIFT_STAMP_COPY}
      </p>
      <p className="mt-3 font-mono text-sm text-foreground">{credit.code}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {giftCreditLabel(credit)} stamped at Gift Desk. Checkout is still test
        pay. The tote does not read this slip.
      </p>
    </article>
  );
}
