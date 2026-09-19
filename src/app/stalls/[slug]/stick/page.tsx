import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothStickBoard } from "@/components/stalls/booth-stick-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_STICK_COOKIE_NAME,
  BOOTH_STICK_PAPER_LINE,
  boothStickFor,
  parseBoothStick,
  stallStickPath,
} from "@/lib/booth-stick";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallStickPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallStickPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't email the zip · ${stall.boothName}`,
    description: `${BOOTH_STICK_PAPER_LINE} Tape the zip note on ${stall.boothName}. The folder still delivers.`,
    path: stallStickPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallStickPage({
  params,
  searchParams,
}: StallStickPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothStick(jar.get(BOOTH_STICK_COOKIE_NAME)?.value);
  const current = boothStickFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothStickBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
