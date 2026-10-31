import type { Metadata } from "next";
import { PageHeading } from "@/components/shell/page-heading";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  return <PageHeading title="Home" description="Nothing here yet." />;
}
