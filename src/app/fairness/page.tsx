import type { Metadata } from "next";
import { PageHeading } from "@/components/shell/page-heading";

export const metadata: Metadata = { title: "Fairness" };

export default function FairnessPage() {
  return (
    <PageHeading
      title="Fairness"
      description="Seed commitments, reveals and replay checks. Nothing here yet."
    />
  );
}
