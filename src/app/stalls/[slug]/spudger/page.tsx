import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothSpudgerBoard } from "@/components/stalls/booth-spudger-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_SPUDGER_COOKIE_NAME,
  BOOTH_SPUDGER_PAPER_LINE,
  boothSpudgerFor,
  parseBoothSpudger,
  stallSpudgerPath,
} from "@/lib/booth-spudger";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallSpudgerPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallSpudgerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a spudger · ${stall.boothName}`,
    description: `${BOOTH_SPUDGER_PAPER_LINE} Tape the spudger note on ${stall.boothName}. Still a blister. Still fused.`,
    path: stallSpudgerPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallSpudgerPage({
  params,
  searchParams,
}: StallSpudgerPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothSpudger(jar.get(BOOTH_SPUDGER_COOKIE_NAME)?.value);
  const current = boothSpudgerFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothSpudgerBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
