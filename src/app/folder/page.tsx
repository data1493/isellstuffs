import type { Metadata } from "next";
import { cookies } from "next/headers";

import { FolderIndexView } from "@/components/folder/folder-views";
import { CHECKOUT_COOKIE, folderSlipFromCookie } from "@/lib/digital-folder";
import { shareMetadata } from "@/lib/seo";

export const metadata: Metadata = shareMetadata({
  title: "Booth folder",
  description:
    "Stand-in files for digital lines on the current checkout slip, or last week's files still in this browser. A booth folder mock — not a CDN, not email.",
  path: "/folder",
  robots: { index: false, follow: false },
});

export default async function FolderIndexPage() {
  const jar = await cookies();
  const seed = folderSlipFromCookie(jar.get(CHECKOUT_COOKIE)?.value);

  return <FolderIndexView seed={seed} />;
}
