import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothKitBoard } from "@/components/stalls/booth-kit-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_KIT_COOKIE_NAME,
  BOOTH_KIT_PAPER_LINE,
  boothKitFor,
  parseBoothKit,
  stallKitPath,
} from "@/lib/booth-kit";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallKitPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallKitPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't assemble · ${stall.boothName}`,
    description: `${BOOTH_KIT_PAPER_LINE} Tape the kit note on ${stall.boothName}. Shade stays in the box.`,
    path: stallKitPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallKitPage({
  params,
  searchParams,
}: StallKitPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothKit(jar.get(BOOTH_KIT_COOKIE_NAME)?.value);
  const current = boothKitFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothKitBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
