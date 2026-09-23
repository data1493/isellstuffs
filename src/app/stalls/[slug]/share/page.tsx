import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { TableShareBoard } from "@/components/stalls/table-share-board";
import { stallBySlug } from "@/lib/commerce";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { stallSharePath } from "@/lib/paths";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";
import {
  TABLE_SHARE_COOKIE_NAME,
  TABLE_SHARE_PAPER_LINE,
  parseTableShare,
  sharePartnerFor,
  tableShareFor,
} from "@/lib/table-share";

export const dynamic = "force-dynamic";

type StallSharePageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallSharePageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `Sharing this table · ${stall.boothName}`,
    description: `${TABLE_SHARE_PAPER_LINE} Tape who is sharing ${stall.boothName}. Not a sitter. Not a seventh stall.`,
    path: stallSharePath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallSharePage({
  params,
  searchParams,
}: StallSharePageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseTableShare(jar.get(TABLE_SHARE_COOKIE_NAME)?.value);
  const current = tableShareFor(stall.id, map);
  const sharer = sharePartnerFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <TableShareBoard
      stall={stall}
      map={map}
      current={current}
      sharer={sharer}
      packed={packed}
      emptyTape={error === "empty"}
      selfTape={error === "self"}
    />
  );
}
