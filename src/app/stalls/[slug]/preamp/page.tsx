import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothPreampBoard } from "@/components/stalls/booth-preamp-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_PREAMP_COOKIE_NAME,
  BOOTH_PREAMP_PAPER_LINE,
  boothPreampFor,
  parseBoothPreamp,
  stallPreampPath,
} from "@/lib/booth-preamp";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallPreampPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallPreampPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a preamp · ${stall.boothName}`,
    description: `${BOOTH_PREAMP_PAPER_LINE} Tape the preamp note on ${stall.boothName}. Still a crate. Still a table.`,
    path: stallPreampPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallPreampPage({
  params,
  searchParams,
}: StallPreampPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothPreamp(jar.get(BOOTH_PREAMP_COOKIE_NAME)?.value);
  const current = boothPreampFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothPreampBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
