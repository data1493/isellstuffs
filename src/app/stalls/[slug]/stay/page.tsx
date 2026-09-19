import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothStayBoard } from "@/components/stalls/booth-stay-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_STAY_COOKIE_NAME,
  BOOTH_STAY_PAPER_LINE,
  boothStayFor,
  parseBoothStay,
} from "@/lib/booth-stay";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { stallStayPath } from "@/lib/paths";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallStayPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallStayPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `Hangers stay · ${stall.boothName}`,
    description: `${BOOTH_STAY_PAPER_LINE} Tape what stays on ${stall.boothName}. Free is extras you can take.`,
    path: stallStayPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallStayPage({
  params,
  searchParams,
}: StallStayPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothStay(jar.get(BOOTH_STAY_COOKIE_NAME)?.value);
  const current = boothStayFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothStayBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
