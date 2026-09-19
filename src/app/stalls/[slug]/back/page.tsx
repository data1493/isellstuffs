import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BackSoonBoard } from "@/components/stalls/back-soon-board";
import {
  BACK_SOON_COOKIE_NAME,
  BACK_SOON_PAPER_LINE,
  backSoonFor,
  parseBackSoon,
} from "@/lib/back-soon";
import { stallBySlug } from "@/lib/commerce";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { stallBackPath } from "@/lib/paths";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallBackPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallBackPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `Back after lunch · ${stall.boothName}`,
    description: `${BACK_SOON_PAPER_LINE} Tape a lunch run on ${stall.boothName}. Not packed. Not new hours.`,
    path: stallBackPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallBackPage({
  params,
  searchParams,
}: StallBackPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBackSoon(jar.get(BACK_SOON_COOKIE_NAME)?.value);
  const current = backSoonFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BackSoonBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
