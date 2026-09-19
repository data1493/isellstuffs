import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothDriverBoard } from "@/components/stalls/booth-driver-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_DRIVER_COOKIE_NAME,
  BOOTH_DRIVER_PAPER_LINE,
  boothDriverFor,
  parseBoothDriver,
  stallDriverPath,
} from "@/lib/booth-driver";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallDriverPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallDriverPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a driver · ${stall.boothName}`,
    description: `${BOOTH_DRIVER_PAPER_LINE} Tape the driver note on ${stall.boothName}. Blister stays closed.`,
    path: stallDriverPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallDriverPage({
  params,
  searchParams,
}: StallDriverPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothDriver(jar.get(BOOTH_DRIVER_COOKIE_NAME)?.value);
  const current = boothDriverFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothDriverBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
