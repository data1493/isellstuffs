import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothSpiderBoard } from "@/components/stalls/booth-spider-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_SPIDER_COOKIE_NAME,
  BOOTH_SPIDER_PAPER_LINE,
  boothSpiderFor,
  parseBoothSpider,
  stallSpiderPath,
} from "@/lib/booth-spider";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallSpiderPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallSpiderPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a spider · ${stall.boothName}`,
    description: `${BOOTH_SPIDER_PAPER_LINE} Tape the spider note on ${stall.boothName}. Still Side A.`,
    path: stallSpiderPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallSpiderPage({
  params,
  searchParams,
}: StallSpiderPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothSpider(jar.get(BOOTH_SPIDER_COOKIE_NAME)?.value);
  const current = boothSpiderFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothSpiderBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
