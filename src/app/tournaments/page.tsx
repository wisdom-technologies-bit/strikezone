import type { Metadata } from "next";
import { PageHeading } from "@/components/shell/page-heading";

export const metadata: Metadata = { title: "Tournaments" };

export default function TournamentsPage() {
  return (
    <PageHeading
      title="Tournaments"
      description="Brackets and scheduled matches. Nothing here yet."
    />
  );
}
