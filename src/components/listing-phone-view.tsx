import Link from "next/link";

import { ListingPhoneEmpty } from "@/components/listing-phone-empty";
import { SyncPhone } from "@/components/listing-phone-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  PHONE_BRICK_LINE,
  PHONE_HONEST_LINE,
  PHONE_MIRROR_SCRIPT,
  PHONE_NOTICE_TITLE,
  PHONE_PARTS_LINE,
  PHONE_REFUSE_COPY,
  PHONE_STILL_LINE,
  PHONE_TABLE_LINE,
  PHONE_TOTE_LINE,
} from "@/lib/listing-phone";
import { listingPath, listingPhoneWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type PhoneViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type PhoneViewSheet = {
  kind: PhoneViewKind;
  listingId: string;
  isPhone: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function PhoneMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={PHONE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function PhoneRefused({ sheet }: { sheet: PhoneViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-phone-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={PHONE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A phone note is for a tangle on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {PHONE_TABLE_LINE} {PHONE_HONEST_LINE} {PHONE_STILL_LINE}
            </p>
          </div>
        }
        actions={
          <>
            {sheet.listing ? (
              <Button
                className="rounded-full px-5"
                render={<Link href={listingPath(sheet.listing.id)} />}
              >
                Back to the listing
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="rounded-full px-5"
              render={<Link href="/explore" />}
            >
              Walk the concourse
            </Button>
          </>
        }
      />
    </div>
  );
}

function PhoneForm({
  listingId,
  isPhone,
}: {
  listingId: string;
  isPhone: boolean;
}) {
  return (
    <form
      method="post"
      action={listingPhoneWritePath()}
      className="space-y-3"
      data-phone-form={isPhone ? "open" : "phone"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isPhone ? "open" : "phone"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/phone`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isPhone ? "Leave the tangle" : "I don't know the phone"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isPhone
          ? "Clear the tape. Status and the tote stay put."
          : `${PHONE_HONEST_LINE} ${PHONE_BRICK_LINE} ${PHONE_STILL_LINE} ${PHONE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingPhoneView({
  sheet,
  phoneIds,
}: {
  sheet: PhoneViewSheet;
  phoneIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <PhoneMissing />;
  }

  if (sheet.kind !== "physical") {
    return <PhoneRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-phone-sheet="physical"
      data-phone-state={sheet.isPhone ? "phone" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: PHONE_MIRROR_SCRIPT }} />
      <SyncPhone listingIds={phoneIds} />

      <MallHero>
        <MallCrumb label="I don't know the phone">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Phone</span>
        </MallCrumb>

        <MallEyebrow>Phone note</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isPhone ? PHONE_NOTICE_TITLE : PHONE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {PHONE_TABLE_LINE} {PHONE_HONEST_LINE} {PHONE_PARTS_LINE} {PHONE_BRICK_LINE}{" "}
            {PHONE_STILL_LINE} {PHONE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-phone-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isPhone ? (
              <Badge variant="outline">I don't know the phone</Badge>
            ) : (
              <Badge variant="ghost">Phone not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Phone tag
          </p>
          <p className="mt-1 font-heading text-5xl tracking-tight sm:text-6xl">
            {sheet.priceLabel ?? formatMoney(sheet.listing!.price)}
          </p>

          <h2 className="mt-3 font-heading text-2xl leading-snug tracking-tight text-balance">
            {sheet.title}
          </h2>

          {sheet.fact ? (
            <p className="mt-2 text-sm leading-6 text-foreground">{sheet.fact}</p>
          ) : null}

          <dl className="mt-5 grid gap-2 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Stall
              </dt>
              <dd className="mt-0.5 font-medium">{sheet.stallName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Aisle
              </dt>
              <dd className="mt-0.5 font-medium">{sheet.hubName}</dd>
            </div>
          </dl>

          <p className="mt-5 text-sm leading-6 text-foreground">
            {sheet.isPhone
              ? "Still for sale. Seller taped the phone note. Status stays available. Not a fourth status."
              : "Parts is the tangle. Pile is won't split. Van is more out back. Tape the note when walkers still ask which phone."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isPhone ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't know the phone"
              title={PHONE_NOTICE_TITLE}
              body={`${PHONE_HONEST_LINE} ${PHONE_BRICK_LINE} ${PHONE_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingPhoneEmpty listingId={sheet.listingId} />
          )}

          <PhoneForm listingId={sheet.listingId} isPhone={sheet.isPhone} />

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={listingPath(sheet.listingId)} />}
            >
              Back to the listing
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={exploreHref({ avail: "open" })} />}
            >
              Still here on the concourse
            </Button>
            {stallHref ? (
              <Button
                variant="outline"
                className="w-full rounded-full sm:w-auto"
                render={<Link href={stallHref} />}
              >
                Open the stall
              </Button>
            ) : null}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
