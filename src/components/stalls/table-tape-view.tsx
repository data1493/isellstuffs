import Link from "next/link";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { StallMissing } from "@/components/mall-missing";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Button } from "@/components/ui/button";
import { stallPath } from "@/lib/paths";
import {
  TAPE_EMPTY_COPY,
  TAPE_HAND_LINE,
  TAPE_SCOOP_LINE,
  type TableTapeSheet,
} from "@/lib/table-tape";

function TapeEmpty({ sheet }: { sheet: TableTapeSheet }) {
  const stall = sheet.stall;

  return (
    <MallNotice
      tone="empty"
      eyebrow="Price sheet"
      title={TAPE_EMPTY_COPY}
      body="Sold and file-gone stay off this sheet. Nothing still here to tape to the table."
      actions={
        stall ? (
          <Button
            className="rounded-full px-5"
            render={<Link href={stallPath(stall.slug)} />}
          >
            Back to the booth
          </Button>
        ) : (
          <Button className="rounded-full px-5" render={<Link href="/explore" />}>
            Walk the concourse
          </Button>
        )
      }
    >
      <div data-table-tape="empty" />
    </MallNotice>
  );
}

function TapeSheet({ sheet }: { sheet: TableTapeSheet }) {
  const stall = sheet.stall;

  if (!stall) {
    return <StallMissing />;
  }

  return (
    <div>
      <MallHero className="print:hidden">
        <MallCrumb label="Price sheet">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Tape</span>
        </MallCrumb>

        <MallEyebrow>Still-here price sheet</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Tape the table.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            One price sheet for what is still on this booth. Screenshot it or
            print it. Sold stickers stay off. {TAPE_SCOOP_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid max-w-2xl gap-6"
      >
        <article
          data-table-tape="sheet"
          data-table-tape-stall={stall.id}
          className="table-tape-print w-full rounded-sm border-2 border-foreground/70 bg-card px-5 py-6 print:rounded-none print:border-black print:bg-white"
        >
          <MallEyebrow className="text-current/55">
            Still here tonight
          </MallEyebrow>
          <h2 className="mt-3 font-heading text-3xl tracking-tight text-balance sm:text-4xl">
            {stall.boothName}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {stall.blurb}
          </p>

          <ul className="mt-6 divide-y divide-border print:divide-black/20">
            {sheet.rows.map((row) => (
              <li
                key={row.listingId}
                data-table-tape-listing={row.listingId}
                data-table-tape-kind={row.kind}
                className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <div className="min-w-0">
                  <p className="font-heading text-xl leading-snug tracking-tight text-balance">
                    {row.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {row.factLabel}
                    </span>
                    {": "}
                    {row.fact}
                  </p>
                </div>
                <p
                  data-table-tape-price={row.listingId}
                  className="font-heading text-3xl tracking-tight sm:text-right"
                >
                  {row.priceLabel}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm leading-6 text-foreground">{sheet.refuse}</p>
          <p className="text-sm leading-6 text-muted-foreground">
            {TAPE_HAND_LINE}
          </p>
        </article>

        <div className="flex flex-col gap-3 print:hidden">
          <Button
            className="w-full rounded-full sm:w-auto"
            render={<Link href={stallPath(stall.slug)} />}
          >
            Back to the booth
          </Button>
        </div>
      </MallSection>
    </div>
  );
}

export function TableTapeView({ sheet }: { sheet: TableTapeSheet }) {
  if (sheet.kind === "missing") {
    return (
      <div data-table-tape="missing">
        <StallMissing />
      </div>
    );
  }

  if (sheet.kind === "empty") {
    return <TapeEmpty sheet={sheet} />;
  }

  return <TapeSheet sheet={sheet} />;
}
