import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

import { WeekTableForm } from "@/components/this-week/week-table-form";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallHero, MallWidth } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { thisWeekEditPath, thisWeekPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";
import {
  eligibleWeekListings,
  rejectedWeekListings,
  resolveWeekPickIds,
  WEEK_PICKS_COOKIE_NAME,
} from "@/lib/week-overlay";

export const dynamic = "force-dynamic";

export const metadata: Metadata = shareMetadata({
  title: "Tape this week's table",
  description:
    "Pick which stand-in SKUs sit on this weekend's mall table. Local overlay. No account.",
  path: thisWeekEditPath(),
  robots: { index: false, follow: true },
});

export default async function ThisWeekEditPage() {
  const jar = await cookies();
  const { ids, fromOverlay } = resolveWeekPickIds(
    jar.get(WEEK_PICKS_COOKIE_NAME)?.value,
  );
  const eligible = eligibleWeekListings();
  const rejected = rejectedWeekListings();

  return (
    <div>
      <MallHero>
        <MallCrumb label="Tape this week's table">
          <CrumbSep />
          <Link
            href={thisWeekPath()}
            className="hover:text-foreground hover:underline"
          >
            This week
          </Link>
          <CrumbSep />
          <span className="text-foreground">Tape the table</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Local overlay
          </Badge>
          <Badge variant="outline" className="rounded-full">
            No account
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a paid stamp
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-5xl">
            Tape the weekend table.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Saturday morning should not need a deploy. Check the stand-in
            SKUs that belong on the folding table. Sold chairs and missing
            files stay off. The mall fixtures come back if you reset.
          </p>
        </div>
      </MallHero>

      <MallWidth className="py-12 sm:py-16">
        <WeekTableForm
          initialIds={ids}
          fromOverlay={fromOverlay}
          eligible={eligible}
          rejected={rejected}
        />
      </MallWidth>
    </div>
  );
}
