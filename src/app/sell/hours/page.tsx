import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallHero, MallWidth } from "@/components/mall-shell";
import { WeekendHoursForm } from "@/components/sell/weekend-hours-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { stallPickupNote } from "@/lib/pickup-display";
import { sellDeskPath, sellHoursPath, sellPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";
import {
  WEEKEND_HOURS_COOKIE,
  hoursStallFromQuery,
  parseWeekendHours,
  readWeekendHours,
  tapedHoursFor,
} from "@/lib/weekend-hours";

export const dynamic = "force-dynamic";

type HoursPageProps = {
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
}: HoursPageProps): Promise<Metadata> {
  const query = searchParams ? await searchParams : {};
  const stall = hoursStallFromQuery(firstQuery(query.stall));
  if (!stall) {
    return shareMetadata({
      title: "That stall packed up.",
      description: "Tape hours on a booth the mall already has. Not a mall hours page.",
      path: sellHoursPath(),
      robots: { index: false, follow: true },
    });
  }
  return shareMetadata({
    title: `Hours for ${stall.boothName}`,
    description:
      "Tape this Saturday. Not a rewrite of the stall. Not a mall hours page.",
    path: sellHoursPath(stall.slug),
    robots: { index: false, follow: true },
  });
}

export default async function SellHoursPage({ searchParams }: HoursPageProps) {
  const query = searchParams ? await searchParams : {};
  const stallParam = firstQuery(query.stall);
  const error = firstQuery(query.error);
  const stall = hoursStallFromQuery(stallParam);

  if (!stall) {
    return (
      <MallNotice
        tone="missing"
        eyebrow="Packed up"
        title="That stall packed up."
        body="The mall only tapes hours on a booth it already has. Tuesday is the default door."
        actions={
          <>
            <Button
              className="rounded-full px-5"
              render={<Link href={sellHoursPath()} />}
            >
              Tape Tuesday
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
    ...readWeekendHours(),
    ...parseWeekendHours(jar.get(WEEKEND_HOURS_COOKIE)?.value),
  };
  const taped = Boolean(tapedHoursFor(stall.id, tapedMap));
  const current = tapedHoursFor(stall.id, tapedMap) ?? stallPickupNote(stall);

  return (
    <div>
      <MallHero>
        <MallCrumb label="Weekend hours">
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
          <span className="text-foreground">Hours</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            This Saturday
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a mall hours page
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-5xl">
            This Saturday.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Tape the hours for {stall.boothName}. Not a rewrite of the stall.
            Not a mall hours page. Pickup and the booth read this card.
          </p>
        </div>
      </MallHero>

      <MallWidth className="py-12 sm:py-16">
        <WeekendHoursForm
          stall={stall}
          current={current}
          taped={taped}
          emptyError={error === "empty"}
        />
      </MallWidth>
    </div>
  );
}
