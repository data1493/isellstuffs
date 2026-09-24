import type { Metadata } from "next";

import { CookieDefaultNotice } from "@/components/agents/agent-slip";
import { ChatRoom } from "@/components/portals/chat-room";
import { FloorRefresh } from "@/components/portals/floor-refresh";
import { HudNotice, portalNotice } from "@/components/portals/hud-chrome";
import { chatMetadata } from "@/lib/seo";
import { loadRequestFloor, oneParam } from "@/lib/request-floor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = chatMetadata();

type ChatPageProps = {
  searchParams?: Promise<{ error?: string | string[] }>;
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const query = searchParams ? await searchParams : {};
  const error = oneParam(query.error);
  const { floor } = await loadRequestFloor();
  const notice = portalNotice(error);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="space-y-4 px-4 pt-6 sm:px-6">
        <FloorRefresh shared={floor.shared} />
        {floor.shared ? null : <CookieDefaultNotice />}
        {notice ? <HudNotice {...notice} /> : null}
      </div>
      <ChatRoom floor={floor} showErrors={false} />
    </div>
  );
}
