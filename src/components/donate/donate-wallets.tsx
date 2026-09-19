import { CopyExact } from "@/components/donate/copy-exact";
import { Badge } from "@/components/ui/badge";
import {
  DONATE_RECEIVE_WALLETS,
  donateEthAddress,
} from "@/lib/donate-wallets";

export function DonateWallets() {
  return (
    <ul className="space-y-3">
      {DONATE_RECEIVE_WALLETS.map((row) => {
        const usdt = row.id === "usdt";
        const xrp = row.id === "xrp";

        return (
          <li
            key={row.id}
            className="rounded-2xl border border-border bg-card px-4 py-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-heading text-xl tracking-tight">{row.asset}</p>
              <Badge variant="outline" className="rounded-full">
                {row.network}
              </Badge>
              {usdt ? (
                <Badge variant="secondary" className="rounded-full">
                  ERC-20 only
                </Badge>
              ) : null}
              {xrp ? (
                <Badge variant="secondary" className="rounded-full">
                  Memo required
                </Badge>
              ) : null}
            </div>

            <p className="mt-3 break-all font-mono text-sm leading-6 text-foreground">
              {row.address}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <CopyExact value={row.address} label={`Copy ${row.asset}`} />
            </div>

            {xrp && "memo" in row ? (
              <div className="mt-4 rounded-xl border border-border bg-background px-3 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Destination tag
                </p>
                <p className="mt-2 font-heading text-2xl tracking-tight">
                  {row.memo}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Required. Copy the memo separately. XRP sent without{" "}
                  {row.memo} does not land in the jar.
                </p>
                <div className="mt-3">
                  <CopyExact value={row.memo} label="Copy memo" />
                </div>
              </div>
            ) : null}

            {usdt ? (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                USDT on Ethereum (ERC-20) only. This is not the ETH address.
                Do not send USDT to {donateEthAddress()}.
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
