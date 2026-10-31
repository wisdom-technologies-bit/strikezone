import type { Metadata } from "next";
import { MeScreen } from "@/features/auth/me-screen";

export const metadata: Metadata = {
  title: "Me",
  robots: { index: false, follow: false },
};

/** The middleware already redirects a signed-out visitor; this page assumes a session. */
export default function MePage() {
  return <MeScreen />;
}
