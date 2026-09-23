import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { searchPath } from "@/lib/paths";

export function SearchEmpty() {
  return (
    <MallNotice
      padded={false}
      titleAs="h2"
      tone="empty"
      eyebrow="Ask the tables"
      title="Nothing to look up yet."
      body="Type a listing title, a stall name, a hub, or physical / digital. Same 12 SKUs as the concourse — no second catalog."
      actions={
        <>
          <Button className="rounded-full px-5" render={<Link href="/explore" />}>
            Explore the concourse
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/hubs" />}
          >
            See the hubs
          </Button>
        </>
      }
    />
  );
}

export function SearchNoResults({ query }: { query: string }) {
  return (
    <MallNotice
      padded={false}
      titleAs="h2"
      tone="empty"
      eyebrow="Not on a table"
      title="Nothing matches that."
      body={`“${query}” is not a title, stall, hub, or physical/digital kind in this mall. Sold stickers stay on the table — this one never sat there.`}
      actions={
        <>
          <Button
            className="rounded-full px-5"
            render={<Link href={searchPath()} />}
          >
            Clear search
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/explore" />}
          >
            Explore the concourse
          </Button>
        </>
      }
    />
  );
}
