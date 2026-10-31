import type { Metadata } from "next";
import { PageHeading } from "@/components/shell/page-heading";

export const metadata: Metadata = { title: "Live" };

export default function LivePage() {
  return <PageHeading title="Live" description="Matches in progress. Nothing here yet." />;
}
