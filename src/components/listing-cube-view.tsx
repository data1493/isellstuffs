import Link from "next/link";

import { ListingCubeEmpty } from "@/components/listing-cube-empty";
import { SyncCube } from "@/components/listing-cube-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  CUBE_LEAVE_LINE,
  CUBE_LOOKS_LINE,
  CUBE_MIRROR_SCRIPT,
  CUBE_NOTICE_TITLE,
  CUBE_PACK_LINE,
  CUBE_REFUSE_COPY,
  CUBE_STAYS_LINE,
  CUBE_STILL_LINE,
  CUBE_TABLE_LINE,
  CUBE_TOTE_LINE,
  CUBE_WALK_LINE,
} from "@/lib/listing-cube";
import { listingCubeWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type CubeViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "owned";

export type CubeViewSheet = {
  kind: CubeViewKind;
  listingId: string;
  isCube: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function CubeMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={CUBE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function CubeRefused({ sheet }: { sheet: CubeViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const owned = sheet.kind === "owned";

  return (
    <div data-cube-sheet={sheet.kind}>
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
        title={CUBE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A cube note is for three parking-lot looks, not a Game Boy and not a gift code."
              )}
            </p>
            <p>
              {CUBE_TABLE_LINE} {CUBE_LOOKS_LINE} {CUBE_PACK_LINE}{" "}
              {CUBE_STILL_LINE}
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

function CubeForm({
  listingId,
  isCube,
}: {
  listingId: string;
  isCube: boolean;
}) {
  return (
    <form
      method="post"
      action={listingCubeWritePath()}
      className="space-y-3"
      data-cube-form={isCube ? "open" : "cube"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isCube ? "open" : "cube"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/cube`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isCube ? CUBE_LEAVE_LINE : CUBE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isCube
          ? "Clear the tape. Status and the tote stay put."
          : `${CUBE_STAYS_LINE} ${CUBE_LOOKS_LINE} ${CUBE_PACK_LINE} ${CUBE_STILL_LINE} ${CUBE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingCubeView({
  sheet,
  cubeIds,
}: {
  sheet: CubeViewSheet;
  cubeIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <CubeMissing />;
  }

  if (sheet.kind !== "digital") {
    return <CubeRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-cube-sheet="digital"
      data-cube-state={sheet.isCube ? "cube" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: CUBE_MIRROR_SCRIPT }} />
      <SyncCube listingIds={cubeIds} />

      <MallHero>
        <MallCrumb label="I will not cube them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Cube</span>
        </MallCrumb>

        <MallEyebrow>I will not cube them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isCube ? CUBE_NOTICE_TITLE : CUBE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {CUBE_TABLE_LINE} {CUBE_LOOKS_LINE} {CUBE_PACK_LINE}{" "}
            {CUBE_WALK_LINE} {CUBE_STAYS_LINE} {CUBE_STILL_LINE}{" "}
            {CUBE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-cube-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isCube ? (
              <Badge variant="outline">I will not cube them</Badge>
            ) : (
              <Badge variant="ghost">Still three looks</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Cube paper
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
            {sheet.isCube
              ? "Still for sale. Seller taped the cube note. Status stays available. Not a LUT shop."
              : "Still three looks. Still a pack. Tape it when walkers still want a fourth .cube."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isCube ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not cube them"
              title={CUBE_NOTICE_TITLE}
              body={`${CUBE_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingCubeEmpty listingId={sheet.listingId} />
          )}

          <CubeForm listingId={sheet.listingId} isCube={sheet.isCube} />

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
