import { buttonVariants } from "@/components/ui/button";
import { formatOfferAmount, type ListingOffer } from "@/lib/listing-offer";
import { listingOfferPeelPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function ListingOfferScrap({
  offer,
  tagLabel,
  title,
  returnTo,
}: {
  offer: ListingOffer;
  tagLabel: string;
  title?: string | null;
  returnTo?: string;
}) {
  const amount = formatOfferAmount(offer.amountCents);

  return (
    <article
      data-offer-scrap=""
      data-offer-listing={offer.listingId}
      data-offer-amount={offer.amountCents}
      className="rounded-2xl border-2 border-dashed border-primary/30 bg-[oklch(0.98_0.02_85)] px-5 py-5 ring-1 ring-primary/10"
      aria-label={`${amount} on ${title ?? "this listing"}`}
    >
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Taped scrap
      </p>
      <p
        data-offer-amount-label=""
        className="mt-2 font-heading text-3xl leading-snug tracking-tight"
      >
        {amount}
      </p>
      <p className="mt-1 text-sm leading-6 text-foreground">
        {title ? (
          <>
            Taped on {title}. Tag is still {tagLabel}.
          </>
        ) : (
          <>Tag is still {tagLabel}.</>
        )}
      </p>
      <form
        method="post"
        action={listingOfferPeelPath(offer.listingId)}
        className="mt-4"
      >
        <input type="hidden" name="offerId" value={offer.id} />
        {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
        <button
          type="submit"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-10 w-full rounded-full sm:w-auto",
          )}
        >
          Peel this scrap
        </button>
      </form>
    </article>
  );
}
