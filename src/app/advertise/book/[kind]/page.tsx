import type { Metadata } from "next";
import Link from "next/link";

import { BookForm } from "@/components/ads/book-form";
import { PaidStamp } from "@/components/ads/paid-stamp";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adKindCopy } from "@/lib/ads-display";
import { nextWindowPackageByKind } from "@/lib/ad-booking";
import { formatMoney } from "@/lib/commerce";
import { advertiseBookPath, advertisePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

type BookKindPageProps = {
  params: Promise<{ kind: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: BookKindPageProps): Promise<Metadata> {
  const { kind } = await params;
  const pack = nextWindowPackageByKind(kind);
  if (!pack) {
    return shareMetadata({
      title: "Not a package",
      description: "That ad kind is not on the next-weekend card.",
      path: advertiseBookPath(kind),
      robots: { index: false, follow: true },
    });
  }
  return shareMetadata({
    title: pack.packageName,
    description: pack.blurb,
    path: advertiseBookPath(pack.kind),
  });
}

export default async function AdvertiseBookKindPage({
  params,
  searchParams,
}: BookKindPageProps) {
  const { kind } = await params;
  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const pack = nextWindowPackageByKind(kind);

  if (!pack) {
    return (
      <MallNotice
        tone="missing"
        eyebrow="Not a package"
        title="That kind is not on the card."
        body="Featured stall, homepage takeover, or hub takeover. Anything else is not a next-weekend corner."
        actions={
          <>
            <Button
              className="rounded-full px-5"
              render={<Link href={advertiseBookPath()} />}
            >
              See next weekend
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-5"
              render={<Link href={advertisePath()} />}
            >
              Rate card
            </Button>
          </>
        }
      />
    );
  }

  const copy = adKindCopy[pack.kind];

  return (
    <div>
      <MallHero>
        <MallCrumb label="Confirm package">
          <CrumbSep />
          <Link
            href={advertisePath()}
            className="hover:text-foreground hover:underline"
          >
            Advertise
          </Link>
          <CrumbSep />
          <Link
            href={advertiseBookPath()}
            className="hover:text-foreground hover:underline"
          >
            Book
          </Link>
          <CrumbSep />
          <span className="text-foreground">{copy.product}</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            {copy.product}
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Always labeled
          </Badge>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-5xl">
              {pack.packageName}
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              {pack.blurb} Name the stall. Pay the mall on paper. Walk out
              with a stamped slip.
            </p>
          </div>
          <PaidStamp className="text-primary" />
        </div>
      </MallHero>

      <MallSection className="border-b border-border">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div>
            <MallEyebrow>Stand-in checkout</MallEyebrow>
            <h2 className="mt-2 font-heading text-3xl tracking-tight">
              Confirm the package.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              {copy.includes} {copy.cannotBuy}
            </p>
            <div className="mt-8">
              <BookForm pack={pack} error={error} />
            </div>
          </div>

          <aside className="rounded-2xl bg-secondary/50 p-5 ring-1 ring-primary/15">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              On the slip
            </p>
            <p className="mt-3 font-heading text-2xl tracking-tight">
              {pack.packageName}
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Window</dt>
                <dd className="font-medium">{pack.window}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Price</dt>
                <dd className="font-heading text-lg">
                  {formatMoney(pack.price)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Stealth</dt>
                <dd className="font-medium">Refused</dd>
              </div>
            </dl>
          </aside>
        </div>
      </MallSection>
    </div>
  );
}
