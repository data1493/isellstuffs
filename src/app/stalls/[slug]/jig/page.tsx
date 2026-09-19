import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothJigBoard } from "@/components/stalls/booth-jig-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_JIG_COOKIE_NAME,
  BOOTH_JIG_PAPER_LINE,
  boothJigFor,
  parseBoothJig,
  stallJigPath,
} from "@/lib/booth-jig";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallJigPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallJigPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a jig · ${stall.boothName}`,
    description: `${BOOTH_JIG_PAPER_LINE} Tape the jig note on ${stall.boothName}. Still a table.`,
    path: stallJigPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallJigPage({
  params,
  searchParams,
}: StallJigPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothJig(jar.get(BOOTH_JIG_COOKIE_NAME)?.value);
  const current = boothJigFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothJigBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
