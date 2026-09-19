import type { Metadata } from "next";
import { cookies } from "next/headers";

import { FolderEmpty } from "@/components/folder/folder-empty";
import { FolderSlip } from "@/components/folder/folder-slip";
import {
  CHECKOUT_COOKIE,
  digitalLinesOnSlip,
  folderSlipFromCookie,
} from "@/lib/digital-folder";
import { shareMetadata } from "@/lib/seo";

export const metadata: Metadata = shareMetadata({
  title: "Booth folder",
  description:
    "Stand-in files for digital lines on the current checkout slip. A booth folder mock — not a CDN, not email.",
  path: "/folder",
  robots: { index: false, follow: false },
});

export default async function FolderIndexPage() {
  const jar = await cookies();
  const session = folderSlipFromCookie(jar.get(CHECKOUT_COOKIE)?.value);
  const lines = session ? digitalLinesOnSlip(session.listingIds) : [];

  if (!session || lines.length === 0) {
    return <FolderEmpty />;
  }

  return <FolderSlip slip={session.id} lines={lines} />;
}
