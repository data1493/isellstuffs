import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothButtonsBoard } from "@/components/stalls/booth-buttons-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_BUTTONS_COOKIE_NAME,
  BOOTH_BUTTONS_PAPER_LINE,
  boothButtonsFor,
  parseBoothButtons,
  stallButtonsPath,
} from "@/lib/booth-buttons";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallButtonsPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallButtonsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have buttons · ${stall.boothName}`,
    description: `${BOOTH_BUTTONS_PAPER_LINE} Tape the buttons note on ${stall.boothName}.`,
    path: stallButtonsPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallButtonsPage({
  params,
  searchParams,
}: StallButtonsPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothButtons(jar.get(BOOTH_BUTTONS_COOKIE_NAME)?.value);
  const current = boothButtonsFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothButtonsBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
