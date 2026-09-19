import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { StallMissing } from "@/components/mall-missing";
import { MallNotice } from "@/components/mall-notice";
import { PickupNote } from "@/components/pickup-note";
import { StallCardCopy } from "@/components/stalls/stall-card-copy";
import {
  BagThisTableButton,
  parseStallBagNotice,
} from "@/components/stalls/bag-table-button";
import { BoothLostLink } from "@/components/stalls/booth-lost-link";
import { FreeBoxLink } from "@/components/stalls/free-box-link";
import { StashTableLink } from "@/components/stalls/stash-table-link";
import { TapeTableLink } from "@/components/stalls/tape-table-link";
import { YardSignLink } from "@/components/stalls/yard-sign-link";
import { WatchStallButton } from "@/components/watch-stall-button";
import { StallListingCard } from "@/components/stall-listing-card";
import { StallMixBar } from "@/components/stall-mix-bar";
import { Badge } from "@/components/ui/badge";
import { AD_BOOKINGS_COOKIE } from "@/lib/ad-booking";
import {
  isDigitalListing,
  isPhysicalListing,
  listingsByStall,
  stallBySlug,
  stalls,
} from "@/lib/commerce";
import {
  featuredBookingsFromCookie,
  resolveFeaturedForStall,
} from "@/lib/featured-ads";
import {
  BACK_SOON_COOKIE_NAME,
  BACK_SOON_PAPER_LINE,
  backSoonFor,
  parseBackSoon,
} from "@/lib/back-soon";
import {
  BOOTH_COVER_COOKIE_NAME,
  BOOTH_COVER_PAPER_LINE,
  coverSitterFor,
  parseBoothCover,
} from "@/lib/booth-cover";
import {
  BREAK_BILLS_COOKIE_NAME,
  BREAK_BILLS_PAPER_LINE,
  breakBillsFor,
  parseBreakBills,
} from "@/lib/break-bills";
import {
  EARLY_FOLD_COOKIE_NAME,
  EARLY_FOLD_PAPER_LINE,
  earlyFoldFor,
  parseEarlyFold,
} from "@/lib/early-fold";
import {
  MOVED_SPOT_COOKIE_NAME,
  MOVED_SPOT_PAPER_LINE,
  movedSpotFor,
  parseMovedSpot,
} from "@/lib/moved-spot";
import { isStallPacked } from "@/lib/packed-stall";
import {
  lotPath,
  stallBackPath,
  stallBreakPath,
  stallCoverPath,
  stallFoldPath,
  stallPath,
  stallScrapPath,
  stallSharePath,
  stallSpotPath,
} from "@/lib/paths";
import {
  TABLE_SHARE_COOKIE_NAME,
  TABLE_SHARE_PAPER_LINE,
  parseTableShare,
  sharePartnerFor,
} from "@/lib/table-share";
import { missingStallMetadata, stallMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type StallPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ bag?: string | string[] }>;
};

export function generateStaticParams() {
  return stalls.map((stall) => ({ slug: stall.slug }));
}

export async function generateMetadata({
  params,
}: StallPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return stallMetadata(stall);
}

export default async function StallPage({
  params,
  searchParams,
}: StallPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const bag = parseStallBagNotice((await searchParams)?.bag);
  const inventory = listingsByStall(stall.id);
  const physical = inventory.filter(isPhysicalListing);
  const digital = inventory.filter(isDigitalListing);
  const jar = await cookies();
  const promo = resolveFeaturedForStall(
    featuredBookingsFromCookie(jar.get(AD_BOOKINGS_COOKIE)?.value),
    stall,
  );
  const lunch = backSoonFor(
    stall.id,
    parseBackSoon(jar.get(BACK_SOON_COOKIE_NAME)?.value),
  );
  const gravel = movedSpotFor(
    stall.id,
    parseMovedSpot(jar.get(MOVED_SPOT_COOKIE_NAME)?.value),
  );
  const sitter = coverSitterFor(
    stall.id,
    parseBoothCover(jar.get(BOOTH_COVER_COOKIE_NAME)?.value),
  );
  const lastCall = earlyFoldFor(
    stall.id,
    parseEarlyFold(jar.get(EARLY_FOLD_COOKIE_NAME)?.value),
  );
  const changeJar = breakBillsFor(
    stall.id,
    parseBreakBills(jar.get(BREAK_BILLS_COOKIE_NAME)?.value),
  );
  const sharer = sharePartnerFor(
    stall.id,
    parseTableShare(jar.get(TABLE_SHARE_COOKIE_NAME)?.value),
  );

  return (
    <div>
      <section className="border-b border-border bg-[linear-gradient(180deg,var(--card),var(--background))]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 sm:py-16">
          <MallCrumb label="Stall location">
            <CrumbSep />
            <span className="text-foreground">{stall.boothName}</span>
          </MallCrumb>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              Independent stall
            </Badge>
            {promo ? (
              <Badge className="rounded-full">Paid the good corner</Badge>
            ) : null}
          </div>

          <StallCardCopy
            stallId={stall.id}
            slug={stall.slug}
            boothName={stall.boothName}
            blurb={stall.blurb}
          />

          {isStallPacked(stall.id) ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Packed up"
              title="This booth packed up."
              body="Files in the folder still exist. Come next weekend. The table went in the car. Not a refund. Not a sold sticker."
            >
              <Link
                href={lotPath()}
                className="text-sm underline-offset-4 hover:underline"
              >
                See the lot
              </Link>
            </MallNotice>
          ) : null}

          {lunch ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Back after lunch"
              title="Stepped away."
              body={
                <p data-back-soon-note={stall.id}>
                  {lunch.note} {BACK_SOON_PAPER_LINE}
                </p>
              }
            />
          ) : null}

          {gravel ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Moved two spots"
              title="New gravel."
              body={
                <p data-moved-spot-note={stall.id}>
                  {gravel.note} {MOVED_SPOT_PAPER_LINE}
                </p>
              }
            />
          ) : null}

          {sitter ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Neighbor is sitting"
              title="Covered."
              body={
                <p data-booth-cover-sitter={stall.id}>
                  {sitter.boothName} {BOOTH_COVER_PAPER_LINE}
                </p>
              }
            />
          ) : null}

          {lastCall ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Folding up at noon"
              title="Last call."
              body={
                <p data-early-fold-note={stall.id}>
                  {lastCall.note} {EARLY_FOLD_PAPER_LINE}
                </p>
              }
            />
          ) : null}

          {changeJar ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I can break a twenty"
              title="Change in the jar."
              body={
                <p data-break-bills-note={stall.id}>
                  {changeJar.note} {BREAK_BILLS_PAPER_LINE}
                </p>
              }
            />
          ) : null}

          {sharer ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Sharing this table"
              title="Two names."
              body={
                <p data-table-share-sharer={stall.id}>
                  {sharer.boothName} {TABLE_SHARE_PAPER_LINE}
                </p>
              }
            />
          ) : null}

          <WatchStallButton stallId={stall.id} returnTo={stallPath(stall.slug)} />

          <Link
            href={stallBackPath(stall.slug)}
            data-back-soon-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Back after lunch
          </Link>

          <Link
            href={stallSpotPath(stall.slug)}
            data-moved-spot-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Moved two spots
          </Link>

          <Link
            href={stallCoverPath(stall.slug)}
            data-booth-cover-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Neighbor is sitting
          </Link>

          <Link
            href={stallFoldPath(stall.slug)}
            data-early-fold-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Folding up at noon
          </Link>

          <Link
            href={stallBreakPath(stall.slug)}
            data-break-bills-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I can break a twenty
          </Link>

          <Link
            href={stallSharePath(stall.slug)}
            data-table-share-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Sharing this table
          </Link>

          <Link
            href={stallScrapPath(stall.slug)}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Tape a scrap on this table
          </Link>

          <BagThisTableButton stallId={stall.id} slug={stall.slug} bag={bag} />

          <TapeTableLink slug={stall.slug} />

          <YardSignLink slug={stall.slug} />

          <StashTableLink slug={stall.slug} />

          <FreeBoxLink slug={stall.slug} />

          <BoothLostLink slug={stall.slug} />

          <StallMixBar physical={physical.length} digital={digital.length} />

          {physical.length > 0 ? (
            <PickupNote stall={stall} className="max-w-2xl" />
          ) : null}

          {promo ? (
            <aside className="max-w-2xl rounded-xl bg-secondary/60 p-4 ring-1 ring-primary/20">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Labeled ad · {promo.slot.packageName} · {promo.slot.window}
              </p>
              <p className="mt-2 font-heading text-xl tracking-tight">
                {promo.slot.headline}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {promo.slot.blurb} Not organic. The booth paid for this corner.
              </p>
            </aside>
          ) : null}
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="rounded-2xl bg-[linear-gradient(180deg,color-mix(in_oklch,var(--secondary)_55%,var(--background)),var(--background))] p-4 sm:p-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              On the table
            </p>
            <h2 className="mt-2 font-heading text-3xl tracking-tight">
              Things you can hold
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Condition is the listing. If it could sit on a folding table, it
              belongs here — not a lookbook.
            </p>
            {physical.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">
                Nothing physical on this table right now. The files are still
                downstairs.
              </p>
            ) : (
              <ul className="mt-6 grid gap-4 lg:grid-cols-2">
                {physical.map((listing) => (
                  <li key={listing.id}>
                    <StallListingCard listing={listing} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-[color-mix(in_oklch,var(--accent)_28%,var(--background))]">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div
            className={cn(
              "rounded-2xl p-4 sm:p-6",
              "bg-[linear-gradient(180deg,color-mix(in_oklch,var(--accent)_50%,var(--card)),transparent)]",
            )}
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Under the table
            </p>
            <h2 className="mt-2 font-heading text-3xl tracking-tight">
              Files from the same stall
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Digital is a listing type, not a second storefront. Format
              stands in for condition.
            </p>
            {digital.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">
                No downloads from this stall right now. The objects are still
                on the table.
              </p>
            ) : (
              <ul className="mt-6 grid gap-4 lg:grid-cols-2">
                {digital.map((listing) => (
                  <li key={listing.id}>
                    <StallListingCard listing={listing} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
