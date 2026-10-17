import DemolitionHome from "@/components/DemolitionHome";
import { SITE } from "@/lib/constants";
import "./dada.css";

export default function HomePage() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    url: `${SITE.url}/`,
    name: SITE.name,
    alternateName: `${SITE.name} · ${SITE.tagline}`,
    inLanguage: "ko-KR",
    publisher: { "@id": `${SITE.url}/#business` },
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }} />
    <DemolitionHome />
  </>;
}
