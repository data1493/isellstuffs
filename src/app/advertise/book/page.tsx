import type { Metadata } from "next";
import Link from "next/link";

import { BookPackageCard } from "@/components/ads/book-package-card";
import { PaidStamp } from "@/components/ads/paid-stamp";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { nextWindowPackages } from "@/lib/ad-booking";
import { advertiseBookPath, advertisePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const metadata: Metadata = shareMetadata({
  title: "Book next weekend",
  description:
    "Buy a labeled corner for next weekend: featured stall, homepage takeover, or hub takeover. Local stand-in. Always stamped.",
  path: advertiseBookPath(),
});

export default function AdvertiseBookPage() {
  return (
    <div>
      <MallHero>
        <MallCrumb label="Book next weekend">
          <CrumbSep />
          <Link
            href={advertisePath()}
            className="hover:text-foreground hover:underline"
          >
            Advertise
          </Link>
          <CrumbSep />
          <span className="text-foreground">Book</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Next window
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Labeled on purpose
          </Badge>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
              Next weekend is still unsold.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              This window’s corners are already on the floor. Book the next
              one: featured stall, homepage takeover, or a hub takeover.
              You get a stamped slip. You do not get stealth.
            </p>
          </div>
          <PaidStamp className="text-primary" />
        </div>
      </MallHero>

      <MallSection className="border-b border-border">
        <MallEyebrow>Three kinds</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          Pick the light you want.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          Local stand-in checkout. No Stripe. The receipt is the proof you
          paid. These bookings do not rewrite home or explore tonight.
        </p>

        <ul className="mt-10 grid gap-4 lg:grid-cols-3">
          {nextWindowPackages.map((pack) => (
            <li key={pack.id}>
              <BookPackageCard pack={pack} />
            </li>
          ))}
        </ul>
      </MallSection>

      <MallSection>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          Sold fixtures stay the live examples. Half-Working still owns the
          good corner this weekend. Beats still owns the homepage.
        </p>
        <div className="mt-4">
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={advertisePath()} />}
          >
            Back to the rate card
          </Button>
        </div>
      </MallSection>
    </div>
  );
}
