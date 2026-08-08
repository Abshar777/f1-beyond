import type { ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactModal from "@/components/layout/ContactModal";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

/**
 * Chrome for the secondary routes.
 *
 * Deliberately not used by the homepage, which composes its own order and adds
 * the `Preloader` and the pricing-offer toast — the preloader is a first-visit
 * intro and the toast advertises a section that only exists on `/`, so neither
 * belongs here.
 *
 * The header is fixed and transparent while unscrolled, so every page dropped in
 * here has to supply its own top padding to clear it.
 */
export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <ContactModal />
      <WhatsAppButton />
    </>
  );
}
