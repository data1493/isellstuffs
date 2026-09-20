import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothProtractorBoard } from "@/components/stalls/booth-protractor-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_PROTRACTOR_COOKIE_NAME,
  BOOTH_PROTRACTOR_PAPER_LINE,
  boothProtractorFor,
  parseBoothProtractor,
  stallProtractorPath,
} from "@/lib/booth-protractor";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallProtractorPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallProtractorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a protractor · ${stall.boothName}`,
    description: `${BOOTH_PROTRACTOR_PAPER_LINE} Tape the protractor note on ${stall.boothName}. Still a crate. Still a skip.`,
    path: stallProtractorPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallProtractorPage({
  params,
  searchParams,
}: StallProtractorPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothProtractor(jar.get(BOOTH_PROTRACTOR_COOKIE_NAME)?.value);
  const current = boothProtractorFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothProtractorBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
