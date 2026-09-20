import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothThrustBoard } from "@/components/stalls/booth-thrust-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_THRUST_COOKIE_NAME,
  BOOTH_THRUST_PAPER_LINE,
  boothThrustFor,
  parseBoothThrust,
  stallThrustPath,
} from "@/lib/booth-thrust";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallThrustPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallThrustPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a thrust · ${stall.boothName}`,
    description: `${BOOTH_THRUST_PAPER_LINE} Tape the thrust note on ${stall.boothName}. Still a crate.`,
    path: stallThrustPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallThrustPage({
  params,
  searchParams,
}: StallThrustPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothThrust(jar.get(BOOTH_THRUST_COOKIE_NAME)?.value);
  const current = boothThrustFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothThrustBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
