import Link from "next/link";

import { ListingWorkbookEmpty } from "@/components/listing-workbook-empty";
import { SyncWorkbook } from "@/components/listing-workbook-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  WORKBOOK_FILE_LINE,
  WORKBOOK_GRADE_LINE,
  WORKBOOK_MIRROR_SCRIPT,
  WORKBOOK_REFUSE_COPY,
  WORKBOOK_SCAN_LINE,
  WORKBOOK_STILL_LINE,
  WORKBOOK_TABLE_LINE,
  WORKBOOK_TOTE_LINE,
} from "@/lib/listing-workbook";
import { listingPath, listingWorkbookWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type WorkbookViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type WorkbookViewSheet = {
  kind: WorkbookViewKind;
  listingId: string;
  isWorkbook: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function WorkbookMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={WORKBOOK_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function WorkbookRefused({ sheet }: { sheet: WorkbookViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-workbook-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={WORKBOOK_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "There is no workbook is for a file on the digital lot, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {WORKBOOK_TABLE_LINE} {WORKBOOK_FILE_LINE} {WORKBOOK_GRADE_LINE}{" "}
              {WORKBOOK_STILL_LINE}
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

function WorkbookForm({
  listingId,
  isWorkbook,
}: {
  listingId: string;
  isWorkbook: boolean;
}) {
  return (
    <form
      method="post"
      action={listingWorkbookWritePath()}
      className="space-y-3"
      data-workbook-form={isWorkbook ? "open" : "workbook"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="intent"
        value={isWorkbook ? "open" : "workbook"}
      />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/workbook`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isWorkbook ? "Take the workbook tape off" : "There is no workbook"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isWorkbook
          ? "Clear the workbook paper. Status and the tote stay put."
          : `${WORKBOOK_FILE_LINE} ${WORKBOOK_GRADE_LINE} ${WORKBOOK_STILL_LINE} ${WORKBOOK_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingWorkbookView({
  sheet,
  workbookIds,
}: {
  sheet: WorkbookViewSheet;
  workbookIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <WorkbookMissing />;
  }

  if (sheet.kind !== "digital") {
    return <WorkbookRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-workbook-sheet="digital"
      data-workbook-state={sheet.isWorkbook ? "workbook" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: WORKBOOK_MIRROR_SCRIPT }} />
      <SyncWorkbook listingIds={workbookIds} />

      <MallHero>
        <MallCrumb label="There is no workbook">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Workbook</span>
        </MallCrumb>

        <MallEyebrow>There is no workbook</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isWorkbook ? WORKBOOK_TABLE_LINE : "There is no workbook."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {WORKBOOK_TABLE_LINE} {WORKBOOK_FILE_LINE} {WORKBOOK_GRADE_LINE}{" "}
            {WORKBOOK_STILL_LINE} {WORKBOOK_TOTE_LINE} {WORKBOOK_SCAN_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-workbook-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isWorkbook ? (
              <Badge variant="outline">The file</Badge>
            ) : (
              <Badge variant="ghost">Open to a book</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Workbook paper
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
            {sheet.isWorkbook
              ? "Still for sale. Seller taped no companion book. The PDF is the file. Status stays available."
              : "Grade is I don't grade. Tape the workbook when the junk PDF has no companion book."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isWorkbook ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="There is no workbook"
              title={WORKBOOK_TABLE_LINE}
              body={`${WORKBOOK_STILL_LINE} avail=open still lists this file. ${WORKBOOK_FILE_LINE}`}
            />
          ) : (
            <ListingWorkbookEmpty listingId={sheet.listingId} />
          )}

          <WorkbookForm
            listingId={sheet.listingId}
            isWorkbook={sheet.isWorkbook}
          />

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
