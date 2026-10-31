import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DataPage } from "./data-page";

// The gate is decided per request, so a build-time value cannot freeze it open.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Data layer",
  robots: { index: false, follow: false },
};

/**
 * The data layer's own page: env, health, config, match counts, and one match's
 * markets and stream. It answers 404 unless GALLERY_PREVIEW=1, in production as
 * well, so it is reachable only where an operator deliberately set that.
 */
export default function DevDataPage() {
  const isProduction = process.env.NODE_ENV === "production";
  const previewAllowed = process.env.GALLERY_PREVIEW === "1";
  if (isProduction && !previewAllowed) notFound();

  return <DataPage />;
}
