import type { Metadata } from "next";
import { PageHeading } from "@/components/shell/page-heading";

export const metadata: Metadata = { title: "My bets" };

export default function BetsPage() {
  return <PageHeading title="My bets" description="Open and settled bets. Nothing here yet." />;
}
