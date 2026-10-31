import type { Metadata } from "next";
import { PageHeading } from "@/components/shell/page-heading";

export const metadata: Metadata = { title: "Wallet" };

export default function WalletPage() {
  return (
    <PageHeading
      title="Wallet"
      description="Balance, deposits and withdrawals. Nothing here yet."
    />
  );
}
