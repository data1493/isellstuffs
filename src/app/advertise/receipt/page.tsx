import type { Metadata } from "next";
import Link from "next/link";

import { BookReceiptView } from "@/components/ads/book-receipt";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { advertiseBookPath, advertisePath, advertiseReceiptPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const metadata: Metadata = shareMetadata({
  title: "Ad receipt",
  description:
    "Paid placement slip for a next-weekend corner. You bought light, not a rewrite.",
  path: advertiseReceiptPath(),
  robots: { index: false, follow: false },
});

function firstQuery(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdvertiseReceiptPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string | string[] }>;
}) {
  const params = await searchParams;
  const bookingId = firstQuery(params.booking)?.trim();

  if (!bookingId) {
    return (
      <MallNotice
        tone="missing"
        eyebrow="No slip"
        title="That booking is not on this desk."
        body="Open a receipt from a booking, or buy next weekend’s corner first. The slip lives in this browser."
        actions={
          <>
            <Button
              className="rounded-full px-5"
              render={<Link href={advertiseBookPath()} />}
            >
              Book next weekend
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

  return (
    <div>
      <MallHero>
        <MallCrumb label="Ad receipt">
          <CrumbSep />
          <Link
            href={advertisePath()}
            className="hover:text-foreground hover:underline"
          >
            Advertise
          </Link>
          <CrumbSep />
          <span className="text-foreground">Receipt</span>
        </MallCrumb>

        <Badge variant="secondary" className="w-fit rounded-full">
          Paid · stand-in
        </Badge>

        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            You’re on the slip.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Local mock. No live charge. The stamp is the product. You bought
            light, not a rewrite.
          </p>
        </div>
      </MallHero>

      <MallSection className="border-b border-border">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] lg:items-start">
          <BookReceiptView bookingId={bookingId} />
          <div className="flex flex-col gap-3">
            <Button
              className="w-full rounded-full sm:w-auto"
              render={<Link href={advertiseBookPath()} />}
            >
              Book another corner
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={advertisePath()} />}
            >
              Rate card
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href="/" />}
            >
              Concourse
            </Button>
          </div>
        </div>
      </MallSection>
    </div>
  );
}
