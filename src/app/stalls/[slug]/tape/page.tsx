import type { Metadata } from "next";

import { TableTapeView } from "@/components/stalls/table-tape-view";
import { stallTapePath } from "@/lib/paths";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";
import { tableTapeForSlug } from "@/lib/table-tape";

export const dynamic = "force-dynamic";

type TapePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: TapePageProps): Promise<Metadata> {
  const { slug } = await params;
  const sheet = tableTapeForSlug(slug);

  if (sheet.kind === "missing" || !sheet.stall) {
    return missingStallMetadata();
  }

  if (sheet.kind === "empty") {
    return shareMetadata({
      title: `No tape · ${sheet.stall.boothName}`,
      description:
        "Nothing still here to tape. Sold and file-gone stay off this sheet.",
      path: stallTapePath(sheet.stall.slug),
      robots: { index: false, follow: false },
    });
  }

  const prices = sheet.rows
    .map((row) => `${row.title} ${row.priceLabel}`)
    .join(", ");

  return shareMetadata({
    title: `Price sheet · ${sheet.stall.boothName}`,
    description: `Still-here prices at ${sheet.stall.boothName}. ${prices}. Sold stickers stay off this sheet.`,
    path: stallTapePath(sheet.stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallTapePage({ params }: TapePageProps) {
  const { slug } = await params;
  const sheet = tableTapeForSlug(slug);

  return <TableTapeView sheet={sheet} />;
}
