import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothReloadBoard } from "@/components/stalls/booth-reload-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_RELOAD_COOKIE_NAME,
  BOOTH_RELOAD_PAPER_LINE,
  boothReloadFor,
  parseBoothReload,
  stallReloadPath,
} from "@/lib/booth-reload";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallReloadPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallReloadPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't reload · ${stall.boothName}`,
    description: `${BOOTH_RELOAD_PAPER_LINE} Tape the reload note on ${stall.boothName}. Face value.`,
    path: stallReloadPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallReloadPage({
  params,
  searchParams,
}: StallReloadPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothReload(jar.get(BOOTH_RELOAD_COOKIE_NAME)?.value);
  const current = boothReloadFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothReloadBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
