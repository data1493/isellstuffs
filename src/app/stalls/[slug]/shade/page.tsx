import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothShadeBoard } from "@/components/stalls/booth-shade-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_SHADE_COOKIE_NAME,
  BOOTH_SHADE_PAPER_LINE,
  boothShadeFor,
  parseBoothShade,
} from "@/lib/booth-shade";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { stallShadePath } from "@/lib/paths";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallShadePageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallShadePageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `Keep it in the shade · ${stall.boothName}`,
    description: `${BOOTH_SHADE_PAPER_LINE} Tape what stays out of the sun on ${stall.boothName}. Rain is still Sunday if wet.`,
    path: stallShadePath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallShadePage({
  params,
  searchParams,
}: StallShadePageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothShade(jar.get(BOOTH_SHADE_COOKIE_NAME)?.value);
  const current = boothShadeFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothShadeBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
