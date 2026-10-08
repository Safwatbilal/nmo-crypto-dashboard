import { absoluteUrl, siteConfig } from "./site";

type JsonLdObject = Record<string, unknown>;

/** Escapes `<` so data can never close the script tag (Next.js JSON-LD guide). */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const ORGANIZATION_ID = `${siteConfig.url}/#organization`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: { "@type": "ImageObject", url: absoluteUrl(siteConfig.logo), width: 512, height: 512 },
  };
}

export function websiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: siteConfig.name,
    alternateName: `${siteConfig.name} Crypto Dashboard`,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en",
    publisher: { "@id": ORGANIZATION_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/")}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function itemListJsonLd(items: { id: string; name: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Top cryptocurrencies by market capitalisation",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(`/market/${item.id}`),
    })),
  };
}

export function assetPageJsonLd(asset: {
  id: string;
  name: string;
  symbol: string;
  description: string;
  image: string | null;
  homepage: string | null;
  lastUpdated: string | null;
}): JsonLdObject {
  const url = absoluteUrl(`/market/${asset.id}`);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: `${asset.name} (${asset.symbol}) price, chart and market cap`,
    description: asset.description,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    ...(asset.lastUpdated ? { dateModified: asset.lastUpdated } : {}),
    primaryImageOfPage: { "@type": "ImageObject", url: `${url}/opengraph-image` },
    about: {
      "@type": "Thing",
      name: asset.name,
      alternateName: asset.symbol,
      ...(asset.image ? { image: asset.image } : {}),
      sameAs: [`https://www.coingecko.com/en/coins/${asset.id}`, ...(asset.homepage ? [asset.homepage] : [])],
    },
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}
