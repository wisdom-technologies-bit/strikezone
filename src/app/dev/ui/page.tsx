import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gallery } from "./gallery";

// The 404 decision is made per request, not baked in at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

/**
 * The gallery is a development surface. It answers 404 in production.
 *
 * GALLERY_PREVIEW=1 exists only so the Lighthouse run can audit the real,
 * production-rendered gallery; it is never set on a deployed environment.
 */
export default function DevUiPage() {
  const isProduction = process.env.NODE_ENV === "production";
  const previewAllowed = process.env.GALLERY_PREVIEW === "1";
  if (isProduction && !previewAllowed) notFound();

  return <Gallery />;
}
