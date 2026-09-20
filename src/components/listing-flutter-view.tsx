import Link from "next/link";

import { ListingFlutterEmpty } from "@/components/listing-flutter-empty";
import { SyncFlutter } from "@/components/listing-flutter-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  FLUTTER_HISS_LINE,
  FLUTTER_LEAVE_LINE,
  FLUTTER_MIRROR_SCRIPT,
  FLUTTER_NOTICE_TITLE,
  FLUTTER_RADIO_LINE,
  FLUTTER_REFUSE_COPY,
  FLUTTER_STAYS_LINE,
  FLUTTER_STILL_LINE,
  FLUTTER_TABLE_LINE,
  FLUTTER_TOTE_LINE,
  FLUTTER_WALK_LINE,
} from "@/lib/listing-flutter";
import { listingFlutterWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type FlutterViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "lp"
  | "jewels"
  | "chair"
  | "owned";

export type FlutterViewSheet = {
  kind: FlutterViewKind;
  listingId: string;
  isFlutter: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function FlutterMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={FLUTTER_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function FlutterRefused({ sheet }: { sheet: FlutterViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const lp = sheet.kind === "lp";
  const jewels = sheet.kind === "jewels";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-flutter-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : lp
                ? "A record is not a cassette"
                : jewels
                  ? "Jewel cases do not flutter"
                  : chair
                    ? "A chair is not a cassette"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={FLUTTER_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A flutter note is for SUMMER 93 on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {FLUTTER_TABLE_LINE} {FLUTTER_HISS_LINE} {FLUTTER_RADIO_LINE}{" "}
              {FLUTTER_STILL_LINE}
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

function FlutterForm({
  listingId,
  isFlutter,
}: {
  listingId: string;
  isFlutter: boolean;
}) {
  return (
    <form
      method="post"
      action={listingFlutterWritePath()}
      className="space-y-3"
      data-flutter-form={isFlutter ? "open" : "flutter"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isFlutter ? "open" : "flutter"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/flutter`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isFlutter ? FLUTTER_LEAVE_LINE : FLUTTER_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isFlutter
          ? "Clear the tape. Status and the tote stay put."
          : `${FLUTTER_STAYS_LINE} ${FLUTTER_HISS_LINE} ${FLUTTER_RADIO_LINE} ${FLUTTER_STILL_LINE} ${FLUTTER_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingFlutterView({
  sheet,
  flutterIds,
}: {
  sheet: FlutterViewSheet;
  flutterIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <FlutterMissing />;
  }

  if (sheet.kind !== "physical") {
    return <FlutterRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-flutter-sheet="physical"
      data-flutter-state={sheet.isFlutter ? "flutter" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: FLUTTER_MIRROR_SCRIPT }} />
      <SyncFlutter listingIds={flutterIds} />

      <MallHero>
        <MallCrumb label="I will not flutter it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Flutter</span>
        </MallCrumb>

        <MallEyebrow>I will not flutter it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isFlutter ? FLUTTER_NOTICE_TITLE : FLUTTER_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {FLUTTER_TABLE_LINE} {FLUTTER_HISS_LINE} {FLUTTER_RADIO_LINE}{" "}
            {FLUTTER_WALK_LINE} {FLUTTER_STAYS_LINE} {FLUTTER_STILL_LINE}{" "}
            {FLUTTER_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-flutter-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isFlutter ? (
              <Badge variant="outline">I will not flutter it</Badge>
            ) : (
              <Badge variant="ghost">Flutter not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Flutter paper
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
            {sheet.isFlutter
              ? "Still for sale. Seller taped the flutter note. Status stays available. Not a shop."
              : "Still hiss. Still a radio edit. Tape it when walkers still want a shop wow."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isFlutter ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not flutter it"
              title={FLUTTER_NOTICE_TITLE}
              body={`${FLUTTER_STILL_LINE} avail=open still lists this tape.`}
            />
          ) : (
            <ListingFlutterEmpty listingId={sheet.listingId} />
          )}

          <FlutterForm listingId={sheet.listingId} isFlutter={sheet.isFlutter} />

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
