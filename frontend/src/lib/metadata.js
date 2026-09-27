const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://tripbuddy-multiagent-travel-planner-1.onrender.com'
).replace(/\/$/, '')

export const SITE_ORIGIN = SITE_URL

export const DEFAULT_DESCRIPTION =
  'TripBuddy AI — a serene multi-agent travel planner that turns your brief into flights, hotels, weather, and a reviewable itinerary.'

export const OG_IMAGE = '/og-image.jpg'

/**
 * Build the static metadata object for a route.
 *
 * Metadata is exported from the server-component route files in app/ so it is
 * baked into the prerendered HTML at build time. That is what crawlers and social
 * scrapers actually read under `output: 'export'`, so per-page tags never depend
 * on JavaScript running.
 */
export function buildMetadata({ title, description = DEFAULT_DESCRIPTION, path = '/' }) {
  const fullTitle = title.includes('TripBuddy') ? title : `${title} · TripBuddy AI`
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`

  return {
    title: fullTitle,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      siteName: 'TripBuddy AI',
      type: 'website',
      url,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [OG_IMAGE],
    },
  }
}

export function buildJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'TripBuddy AI',
    url: `${SITE_URL}/`,
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Any',
    description: DEFAULT_DESCRIPTION,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
}
