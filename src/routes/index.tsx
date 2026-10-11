import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout";
import {
  CategoryChips,
  HomeHero,
  NewArrivals,
  PerksStrip,
  ScentQuizAndGifts,
  SelectionGrid,
  TrustSection,
  UniverseCircles,
  WhatsAppBand,
} from "@/components/home-sections";
import { fetchProofs, fetchTestimonials } from "@/lib/vitrine";
import { fetchProducts, fetchCategories } from "@/lib/products";
import { OG_IMAGE_META, SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";
import { jsonLd } from "@/lib/json-ld";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE_CONFIG.name} — Parfums authentiques à Cotonou, Bénin` },
      {
        name: "description",
        content:
          "Parfumerie d'exception à Cotonou, Bénin. Collection de parfums, huiles et coffrets authentiques. Commande WhatsApp, livraison au Bénin et dans la sous-région.",
      },
      { property: "og:title", content: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}` },
      {
        property: "og:description",
        content:
          "Parfums de marque 100 % authentiques à Cotonou. Paiement à la livraison (MoMo, espèces), livraison au Bénin et dans la sous-région.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/") },
      { name: "twitter:card", content: "summary_large_image" },
      ...OG_IMAGE_META,
      { name: "twitter:image", content: SITE_CONFIG.ogImageUrl },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/") }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd({
          "@context": "https://schema.org",
          "@type": ["Store", "PerfumeStore"],
          "@id": `${SITE_CONFIG.url}/#store`,
          name: SITE_CONFIG.name,
          alternateName: SITE_CONFIG.alternateNames,
          parentOrganization: { "@id": `${SITE_CONFIG.url}/#organization` },
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: SITE_CONFIG.openingHours.days,
            opens: SITE_CONFIG.openingHours.opens,
            closes: SITE_CONFIG.openingHours.closes,
          },
          description: SITE_CONFIG.description,
          url: SITE_CONFIG.url,
          logo: SITE_CONFIG.logoUrl,
          image: SITE_CONFIG.ogImageUrl,
          telephone: SITE_CONFIG.phone,
          currenciesAccepted: SITE_CONFIG.currency,
          paymentAccepted: "Espèces, MTN MoMo, Moov Money",
          address: {
            "@type": "PostalAddress",
            addressLocality: SITE_CONFIG.address.addressLocality,
            addressCountry: SITE_CONFIG.address.addressCountry,
          },
          areaServed: [
            "Bénin",
            "Togo",
            "Nigeria",
            "Niger",
            "Burkina Faso",
            "Côte d'Ivoire",
            "Ghana",
          ],
          sameAs: [`https://wa.me/${SITE_CONFIG.whatsapp.replace(/[^0-9]/g, "")}`],
        }),
      },
      {
        type: "application/ld+json",
        children: jsonLd({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${SITE_CONFIG.url}/#website`,
          name: SITE_CONFIG.name,
          alternateName: SITE_CONFIG.alternateNames,
          inLanguage: "fr",
          publisher: { "@id": `${SITE_CONFIG.url}/#organization` },
          url: SITE_CONFIG.url,
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_CONFIG.url}/boutique?search={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["products"],
        queryFn: () => fetchProducts(),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["categories"],
        queryFn: fetchCategories,
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["authenticity-proofs"],
        queryFn: fetchProofs,
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["testimonials"],
        queryFn: fetchTestimonials,
      }),
    ]);
  },
  component: HomePage,
});

function HomePage() {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return (
    <SiteLayout>
      <CategoryChips />
      <HomeHero productCount={products.length} />
      {/* Mobile : les produits avant tout le reste. Desktop : univers d'abord, comme sur la maquette. */}
      <div className="hidden lg:block">
        <UniverseCircles categories={categories} />
      </div>
      <div className="hidden lg:block">
        <PerksStrip />
      </div>
      <SelectionGrid products={products} />
      <div className="lg:hidden">
        <PerksStrip />
        <UniverseCircles categories={categories} />
      </div>
      <NewArrivals products={products} />
      <ScentQuizAndGifts products={products} />
      <TrustSection />
      <WhatsAppBand />
      <div className="h-12 lg:h-20" />
    </SiteLayout>
  );
}
