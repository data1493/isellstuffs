/**
 * Public jar receive addresses for /donate.
 *
 * Copy-paste only. No private keys. No extra chains.
 * ETH and USDT are different 0x strings. USDT is ERC-20 only.
 * XRP memo is required and copied separately from the address.
 */

export const DONATE_XRP_MEMO = "311351780";

export const DONATE_RECEIVE_WALLETS = [
  {
    id: "sol",
    asset: "SOL",
    network: "Solana",
    address: "AyWQjwqu4sSDk5YN6W769ya2fqaNo9JNrvs6dENV8cqx",
  },
  {
    id: "eth",
    asset: "ETH",
    network: "Ethereum",
    address: "0xc83584087C888829F40bAbD558CFD21FFba880fE",
  },
  {
    id: "xrp",
    asset: "XRP",
    network: "XRP Ledger",
    address: "rwnYLUsoBQX3ECa1A5bSKLdbPoHKnqf63J",
    memo: DONATE_XRP_MEMO,
    memoRequired: true,
  },
  {
    id: "btc",
    asset: "BTC",
    network: "Bitcoin",
    address: "34FySBLQewD3scC6kYLHZ5t2RJkCbkKbB8",
  },
  {
    id: "usdt",
    asset: "USDT",
    network: "ERC-20",
    address: "0xBaA226F7ceC5622e35752A148E0e4bf2988Ec00d",
    erc20Only: true,
  },
  {
    id: "doge",
    asset: "DOGE",
    network: "Dogecoin",
    address: "DRuGi348xvKAoFAP8edWUkVgSTLpj654L1",
  },
] as const;

export type DonateReceiveWallet = (typeof DONATE_RECEIVE_WALLETS)[number];

export function donateEthAddress() {
  return DONATE_RECEIVE_WALLETS.find((row) => row.id === "eth")!.address;
}

export function donateUsdtAddress() {
  return DONATE_RECEIVE_WALLETS.find((row) => row.id === "usdt")!.address;
}
