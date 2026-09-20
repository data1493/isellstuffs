import Link from "next/link";

import { ListingSingeEmpty } from "@/components/listing-singe-empty";
import { SyncSinge } from "@/components/listing-singe-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  SINGE_HOLE_LINE,
  SINGE_JACKET_LINE,
  SINGE_LEAVE_LINE,
  SINGE_MIRROR_SCRIPT,
  SINGE_NOTICE_TITLE,
  SINGE_REFUSE_COPY,
  SINGE_STAYS_LINE,
  SINGE_STILL_LINE,
  SINGE_TABLE_LINE,
  SINGE_TOTE_LINE,
  SINGE_WALK_LINE,
} from "@/lib/listing-singe";
import { listingPath, listingSingeWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type SingeViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "sneakers"
  | "mug"
  | "chair"
  | "owned";

export type SingeViewSheet = {
  kind: SingeViewKind;
  listingId: string;
  isSinge: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function SingeMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={SINGE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function SingeRefused({ sheet }: { sheet: SingeViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const sneakers = sheet.kind === "sneakers";
  const mug = sheet.kind === "mug";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-singe-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : sneakers
                ? "Soles do not singe"
                : mug
                  ? "A mug is not a jacket"
                  : chair
                    ? "A chair is not a jacket"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={SINGE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A singe note is for the mint-green jacket on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {SINGE_TABLE_LINE} {SINGE_JACKET_LINE} {SINGE_HOLE_LINE}{" "}
              {SINGE_STILL_LINE}
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

function SingeForm({
  listingId,
  isSinge,
}: {
  listingId: string;
  isSinge: boolean;
}) {
  return (
    <form
      method="post"
      action={listingSingeWritePath()}
      className="space-y-3"
      data-singe-form={isSinge ? "open" : "singe"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isSinge ? "open" : "singe"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/singe`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isSinge ? SINGE_LEAVE_LINE : SINGE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isSinge
          ? "Clear the tape. Status and the tote stay put."
          : `${SINGE_STAYS_LINE} ${SINGE_JACKET_LINE} ${SINGE_HOLE_LINE} ${SINGE_STILL_LINE} ${SINGE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingSingeView({
  sheet,
  singeIds,
}: {
  sheet: SingeViewSheet;
  singeIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <SingeMissing />;
  }

  if (sheet.kind !== "physical") {
    return <SingeRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-singe-sheet="physical"
      data-singe-state={sheet.isSinge ? "singe" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: SINGE_MIRROR_SCRIPT }} />
      <SyncSinge listingIds={singeIds} />

      <MallHero>
        <MallCrumb label="I will not singe it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Singe</span>
        </MallCrumb>

        <MallEyebrow>I will not singe it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isSinge ? SINGE_NOTICE_TITLE : SINGE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {SINGE_TABLE_LINE} {SINGE_JACKET_LINE} {SINGE_HOLE_LINE}{" "}
            {SINGE_WALK_LINE} {SINGE_STAYS_LINE} {SINGE_STILL_LINE}{" "}
            {SINGE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-singe-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isSinge ? (
              <Badge variant="outline">I will not singe it</Badge>
            ) : (
              <Badge variant="ghost">Singe not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Singe paper
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
            {sheet.isSinge
              ? "Still for sale. Seller taped the singe note. Status stays available. Not a shop."
              : "Still a jacket. Still a hole. Tape it when walkers still want a shop burn."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isSinge ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not singe it"
              title={SINGE_NOTICE_TITLE}
              body={`${SINGE_STILL_LINE} avail=open still lists this jacket.`}
            />
          ) : (
            <ListingSingeEmpty listingId={sheet.listingId} />
          )}

          <SingeForm listingId={sheet.listingId} isSinge={sheet.isSinge} />

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
