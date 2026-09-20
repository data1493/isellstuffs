import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothVariacBoard } from "@/components/stalls/booth-variac-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_VARIAC_COOKIE_NAME,
  BOOTH_VARIAC_PAPER_LINE,
  boothVariacFor,
  parseBoothVariac,
  stallVariacPath,
} from "@/lib/booth-variac";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallVariacPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallVariacPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a variac · ${stall.boothName}`,
    description: `${BOOTH_VARIAC_PAPER_LINE} Tape the variac note on ${stall.boothName}. Still a driveway. Still no bench.`,
    path: stallVariacPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallVariacPage({
  params,
  searchParams,
}: StallVariacPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothVariac(jar.get(BOOTH_VARIAC_COOKIE_NAME)?.value);
  const current = boothVariacFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothVariacBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
