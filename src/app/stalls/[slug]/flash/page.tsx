import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothFlashBoard } from "@/components/stalls/booth-flash-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_FLASH_COOKIE_NAME,
  BOOTH_FLASH_PAPER_LINE,
  boothFlashFor,
  parseBoothFlash,
  stallFlashPath,
} from "@/lib/booth-flash";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallFlashPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallFlashPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't flash · ${stall.boothName}`,
    description: `${BOOTH_FLASH_PAPER_LINE} Tape the flash note on ${stall.boothName}. What boots is what boots.`,
    path: stallFlashPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallFlashPage({
  params,
  searchParams,
}: StallFlashPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothFlash(jar.get(BOOTH_FLASH_COOKIE_NAME)?.value);
  const current = boothFlashFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothFlashBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
