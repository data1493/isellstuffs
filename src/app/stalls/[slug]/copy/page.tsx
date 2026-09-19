import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothCopyBoard } from "@/components/stalls/booth-copy-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_COPY_COOKIE_NAME,
  BOOTH_COPY_PAPER_LINE,
  boothCopyFor,
  parseBoothCopy,
  stallCopyPath,
} from "@/lib/booth-copy";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallCopyPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallCopyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I will not copy onto your stick · ${stall.boothName}`,
    description: `${BOOTH_COPY_PAPER_LINE} Tape the copy note on ${stall.boothName}. Folder after pay.`,
    path: stallCopyPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallCopyPage({
  params,
  searchParams,
}: StallCopyPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothCopy(jar.get(BOOTH_COPY_COOKIE_NAME)?.value);
  const current = boothCopyFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothCopyBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
