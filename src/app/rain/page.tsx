import type { Metadata } from "next";
import { cookies } from "next/headers";

import { RainBoard } from "@/app/rain/rain-board";
import { RainEmpty } from "@/app/rain/rain-empty";
import { rainPath } from "@/lib/paths";
import {
  RAIN_DATE_COOKIE,
  RAIN_DATE_MIRROR_SCRIPT,
  parseRainDates,
  rainDateBoard,
  readRainDates,
} from "@/lib/rain-date";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = shareMetadata({
  title: "Rain Sunday",
  description:
    "Booths that taped a Sunday rain date. Same driveway if Saturday is wet. Hours on the lamp stay Saturday.",
  path: rainPath(),
  robots: { index: false, follow: true },
});

export default async function RainPage() {
  const jar = await cookies();
  const map = {
    ...readRainDates(),
    ...parseRainDates(jar.get(RAIN_DATE_COOKIE)?.value),
  };
  const rows = rainDateBoard(map);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: RAIN_DATE_MIRROR_SCRIPT }} />
      {rows.length === 0 ? <RainEmpty /> : <RainBoard rows={rows} />}
    </>
  );
}
