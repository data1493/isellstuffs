import Link from "next/link";

import { ListingKernEmpty } from "@/components/listing-kern-empty";
import { SyncKern } from "@/components/listing-kern-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  KERN_LEAVE_LINE,
  KERN_MAP_LINE,
  KERN_MIRROR_SCRIPT,
  KERN_NOTICE_TITLE,
  KERN_REFUSE_COPY,
  KERN_STAYS_LINE,
  KERN_STILL_LINE,
  KERN_TABLE_LINE,
  KERN_TOTE_LINE,
  KERN_WALK_LINE,
  KERN_WEIGHTS_LINE,
} from "@/lib/listing-kern";
import { listingKernWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type KernViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "owned";

export type KernViewSheet = {
  kind: KernViewKind;
  listingId: string;
  isKern: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function KernMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={KERN_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function KernRefused({ sheet }: { sheet: KernViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const owned = sheet.kind === "owned";

  return (
    <div data-kern-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : owned
              ? "Another note already owns that one"
              : object
                ? "On the table"
                : "Walked"
        }
        title={KERN_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A kern note is for the booth font, not a jacket and not a gift code."
              )}
            </p>
            <p>
              {KERN_TABLE_LINE} {KERN_WEIGHTS_LINE} {KERN_MAP_LINE} {KERN_STILL_LINE}
            </p>
          </div>
        }
        actions={
          <>
            {sheet.listing ? (
              <Button
                className="h-11 w-full rounded-full px-5 sm:w-auto"
                render={<Link href={listingPath(sheet.listing.id)} />}
              >
                Back to the listing
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="h-11 w-full rounded-full px-5 sm:w-auto"
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

function KernForm({
  listingId,
  isKern,
}: {
  listingId: string;
  isKern: boolean;
}) {
  return (
    <form
      method="post"
      action={listingKernWritePath()}
      className="space-y-3"
      data-kern-form={isKern ? "open" : "kern"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isKern ? "open" : "kern"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/kern`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isKern ? KERN_LEAVE_LINE : KERN_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isKern
          ? "Clear the tape. Status and the tote stay put."
          : `${KERN_STAYS_LINE} ${KERN_WEIGHTS_LINE} ${KERN_MAP_LINE} ${KERN_STILL_LINE} ${KERN_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingKernView({
  sheet,
  kernIds,
}: {
  sheet: KernViewSheet;
  kernIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <KernMissing />;
  }

  if (sheet.kind !== "digital") {
    return <KernRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-kern-sheet="digital"
      data-kern-state={sheet.isKern ? "kern" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: KERN_MIRROR_SCRIPT }} />
      <SyncKern listingIds={kernIds} />

      <MallHero>
        <MallCrumb label="I will not kern it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Kern</span>
        </MallCrumb>

        <MallEyebrow>I will not kern it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isKern ? KERN_NOTICE_TITLE : KERN_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {KERN_TABLE_LINE} {KERN_WEIGHTS_LINE} {KERN_MAP_LINE} {KERN_WALK_LINE}{" "}
            {KERN_STAYS_LINE} {KERN_STILL_LINE} {KERN_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-kern-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isKern ? (
              <Badge variant="outline">I will not kern it</Badge>
            ) : (
              <Badge variant="ghost">Still a map</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Kern paper
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
            {sheet.isKern
              ? "Still for sale. Seller taped the kern note. Status stays available. Not pairing software. Not an account."
              : "Still two weights. Still a map. Tape it when walkers still want the pairs tightened."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isKern ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not kern it"
              title={KERN_NOTICE_TITLE}
              body={`${KERN_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingKernEmpty listingId={sheet.listingId} />
          )}

          <KernForm listingId={sheet.listingId} isKern={sheet.isKern} />

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="h-11 w-full rounded-full sm:w-auto"
              render={<Link href={listingPath(sheet.listingId)} />}
            >
              Back to the listing
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full rounded-full sm:w-auto"
              render={<Link href={exploreHref({ avail: "open" })} />}
            >
              Still here on the concourse
            </Button>
            {stallHref ? (
              <Button
                variant="outline"
                className="h-11 w-full rounded-full sm:w-auto"
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
