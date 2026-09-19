import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothSpindleBoard } from "@/components/stalls/booth-spindle-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_SPINDLE_COOKIE_NAME,
  BOOTH_SPINDLE_PAPER_LINE,
  boothSpindleFor,
  parseBoothSpindle,
  stallSpindlePath,
} from "@/lib/booth-spindle";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallSpindlePageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallSpindlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a spindle · ${stall.boothName}`,
    description: `${BOOTH_SPINDLE_PAPER_LINE} Tape the spindle note on ${stall.boothName}. Still a jewel.`,
    path: stallSpindlePath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallSpindlePage({
  params,
  searchParams,
}: StallSpindlePageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothSpindle(jar.get(BOOTH_SPINDLE_COOKIE_NAME)?.value);
  const current = boothSpindleFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothSpindleBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
