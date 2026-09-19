import Link from "next/link";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { StallMissing } from "@/components/mall-missing";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Button } from "@/components/ui/button";
import { lotPath, stallPath } from "@/lib/paths";
import {
  SIGN_HAND_LINE,
  SIGN_PACKED_COPY,
  SIGN_STREET_LINE,
  type YardSignSheet,
} from "@/lib/yard-sign";

function SignPacked({ sheet }: { sheet: YardSignSheet }) {
  const stall = sheet.stall;

  return (
    <MallNotice
      tone="empty"
      eyebrow="Yard sign"
      title={SIGN_PACKED_COPY}
      body="The table went in the car. Come next weekend. A packed booth does not put a sign at the curb."
      actions={
        <>
          {stall ? (
            <Button
              className="rounded-full px-5"
              render={<Link href={stallPath(stall.slug)} />}
            >
              Back to the booth
            </Button>
          ) : null}
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={lotPath()} />}
          >
            See the lot
          </Button>
        </>
      }
    >
      <div
        data-yard-sign="packed"
        data-yard-sign-stall={stall?.id ?? ""}
      />
    </MallNotice>
  );
}

function SignSheet({ sheet }: { sheet: YardSignSheet }) {
  const stall = sheet.stall;

  if (!stall) {
    return <StallMissing />;
  }

  return (
    <div>
      <MallHero className="print:hidden">
        <MallCrumb label="Yard sign">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Sign</span>
        </MallCrumb>

        <MallEyebrow>Street sheet · hours</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Put this at the curb.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            A driveway sign with hours. Screenshot it or print it.{" "}
            {SIGN_STREET_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid max-w-2xl gap-6"
      >
        <article
          data-yard-sign="sheet"
          data-yard-sign-stall={stall.id}
          className="yard-sign-print w-full rounded-sm border-2 border-foreground/70 bg-card px-5 py-8 print:rounded-none print:border-black print:bg-white"
        >
          <MallEyebrow className="text-current/55">Yard sale</MallEyebrow>
          <h2
            data-yard-sign-name=""
            className="mt-3 font-heading text-4xl tracking-tight text-balance sm:text-5xl"
          >
            {stall.boothName}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {stall.blurb}
          </p>

          <p
            data-yard-sign-hours=""
            className="mt-8 font-heading text-3xl leading-tight tracking-tight text-balance sm:text-4xl"
          >
            {sheet.hours}
          </p>
          <p
            data-yard-sign-place=""
            className="mt-3 text-base leading-7 text-foreground"
          >
            {sheet.place}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {sheet.note}
          </p>

          <p className="mt-8 text-sm leading-6 text-foreground">{sheet.refuse}</p>
          <p className="text-sm leading-6 text-muted-foreground">
            {SIGN_HAND_LINE}
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

export function YardSignView({ sheet }: { sheet: YardSignSheet }) {
  if (sheet.kind === "missing") {
    return (
      <div data-yard-sign="missing">
        <StallMissing />
      </div>
    );
  }

  if (sheet.kind === "packed") {
    return <SignPacked sheet={sheet} />;
  }

  return <SignSheet sheet={sheet} />;
}
