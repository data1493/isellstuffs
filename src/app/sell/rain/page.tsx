import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallHero, MallWidth } from "@/components/mall-shell";
import { RainDateForm } from "@/components/sell/rain-date-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { rainPath, sellDeskPath, sellPath, sellRainPath } from "@/lib/paths";
import {
  RAIN_DATE_COOKIE,
  parseRainDates,
  rainStallFromQuery,
  readRainDates,
  tapedRainDateFor,
} from "@/lib/rain-date";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RainSellPageProps = {
  searchParams?: Promise<{
    stall?: string | string[];
    error?: string | string[];
  }>;
};

function firstQuery(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  searchParams,
}: RainSellPageProps): Promise<Metadata> {
  const query = searchParams ? await searchParams : {};
  const stall = rainStallFromQuery(firstQuery(query.stall));
  if (!stall) {
    return shareMetadata({
      title: "That stall packed up.",
      description:
        "Tape a Sunday rain date on a booth the mall already has. Not this weekend’s hours.",
      path: sellRainPath(),
      robots: { index: false, follow: true },
    });
  }
  return shareMetadata({
    title: `Rain date for ${stall.boothName}`,
    description:
      "Tape Sunday if Saturday is wet. Same driveway. Not a rewrite of this weekend’s hours.",
    path: sellRainPath(stall.slug),
    robots: { index: false, follow: true },
  });
}

export default async function SellRainPage({ searchParams }: RainSellPageProps) {
  const query = searchParams ? await searchParams : {};
  const stallParam = firstQuery(query.stall);
  const error = firstQuery(query.error);
  const stall = rainStallFromQuery(stallParam);

  if (!stall) {
    return (
      <MallNotice
        tone="missing"
        eyebrow="Packed up"
        title="That stall packed up."
        body="The mall only tapes a rain date on a booth it already has. Tuesday is the default door."
        actions={
          <>
            <Button
              className="rounded-full px-5"
              render={<Link href={sellRainPath()} />}
            >
              Tape Tuesday
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-5"
              render={<Link href={rainPath()} />}
            >
              Rain Sunday
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-5"
              render={<Link href={sellDeskPath()} />}
            >
              Back to the desk
            </Button>
          </>
        }
      />
    );
  }

  const jar = await cookies();
  const tapedMap = {
    ...readRainDates(),
    ...parseRainDates(jar.get(RAIN_DATE_COOKIE)?.value),
  };
  const taped = tapedRainDateFor(stall.id, tapedMap);

  return (
    <div>
      <MallHero>
        <MallCrumb label="Rain date">
          <CrumbSep />
          <Link href={sellPath()} className="hover:text-foreground hover:underline">
            Sell
          </Link>
          <CrumbSep />
          <Link
            href={sellDeskPath()}
            className="hover:text-foreground hover:underline"
          >
            Desk
          </Link>
          <CrumbSep />
          <span className="text-foreground">Rain</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            If Saturday is wet
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not this weekend’s hours
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-5xl">
            Sunday if it rains.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Tape a rain date for {stall.boothName}. Hours stay Saturday. Weather
            needs Sunday, same driveway if wet. Pickup still recites the
            Saturday plan.
          </p>
        </div>
      </MallHero>

      <MallWidth className="py-12 sm:py-16">
        <RainDateForm
          stall={stall}
          taped={taped}
          emptyError={error === "empty"}
        />
      </MallWidth>
    </div>
  );
}
