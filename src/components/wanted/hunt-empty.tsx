import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";

export function HuntEmpty() {
  return (
    <MallNotice
      tone="empty"
      padded={false}
      titleAs="h2"
      eyebrow="Hunt board"
      title="The cork is empty."
      body="Nobody taped a hunt in this browser. Write what you need and leave it on the board. This is not a listing and it is not the later pile."
      actions={
        <Button
          variant="outline"
          className="rounded-full px-5"
          render={<Link href="/explore" />}
        >
          Walk the concourse
        </Button>
      }
    />
  );
}
