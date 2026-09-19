import Link from "next/link";

import { ListingGradeEmpty } from "@/components/listing-grade-empty";
import { SyncGrade } from "@/components/listing-grade-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  GRADE_MIRROR_SCRIPT,
  GRADE_REFUSE_COPY,
  GRADE_SCAN_LINE,
  GRADE_SHOT_LINE,
  GRADE_STICK_LINE,
  GRADE_STILL_LINE,
  GRADE_TABLE_LINE,
  GRADE_TOTE_LINE,
} from "@/lib/listing-grade";
import { listingGradeWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type GradeViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type GradeViewSheet = {
  kind: GradeViewKind;
  listingId: string;
  isGrade: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function GradeMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={GRADE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function GradeRefused({ sheet }: { sheet: GradeViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-grade-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={GRADE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "I don't grade your lot is for a file on the digital lot, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {GRADE_TABLE_LINE} {GRADE_SHOT_LINE} {GRADE_STICK_LINE}{" "}
              {GRADE_STILL_LINE}
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

function GradeForm({
  listingId,
  isGrade,
}: {
  listingId: string;
  isGrade: boolean;
}) {
  return (
    <form
      method="post"
      action={listingGradeWritePath()}
      className="space-y-3"
      data-grade-form={isGrade ? "open" : "grade"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isGrade ? "open" : "grade"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/grade`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isGrade ? "Take the as-shot tape off" : "I don't grade your lot"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isGrade
          ? "Clear the grade paper. Status and the tote stay put."
          : `${GRADE_SHOT_LINE} ${GRADE_STICK_LINE} ${GRADE_STILL_LINE} ${GRADE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingGradeView({
  sheet,
  gradeIds,
}: {
  sheet: GradeViewSheet;
  gradeIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <GradeMissing />;
  }

  if (sheet.kind !== "digital") {
    return <GradeRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-grade-sheet="digital"
      data-grade-state={sheet.isGrade ? "grade" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: GRADE_MIRROR_SCRIPT }} />
      <SyncGrade listingIds={gradeIds} />

      <MallHero>
        <MallCrumb label="I don't grade your lot">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Grade</span>
        </MallCrumb>

        <MallEyebrow>I don't grade your lot</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isGrade ? GRADE_TABLE_LINE : "I don't grade your lot."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {GRADE_TABLE_LINE} {GRADE_SHOT_LINE} {GRADE_STICK_LINE}{" "}
            {GRADE_STILL_LINE} {GRADE_TOTE_LINE} {GRADE_SCAN_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-grade-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isGrade ? (
              <Badge variant="outline">As-shot</Badge>
            ) : (
              <Badge variant="ghost">Open to grade</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Grade paper
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
            {sheet.isGrade
              ? "Still for sale. Seller taped as-shot. Walkers still ask Beats for a custom grade. Status stays available."
              : "Stick is no email. Tape the grade when the LUTs stay as-shot."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isGrade ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't grade your lot"
              title={GRADE_TABLE_LINE}
              body={`${GRADE_STILL_LINE} avail=open still lists this file. ${GRADE_SHOT_LINE}`}
            />
          ) : (
            <ListingGradeEmpty listingId={sheet.listingId} />
          )}

          <GradeForm listingId={sheet.listingId} isGrade={sheet.isGrade} />

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
