const DEFAULT_DESCRIPTION =
  'TripBuddy AI — a serene multi-agent travel planner that turns your brief into flights, hotels, weather, and a reviewable itinerary.'

const PRODUCTION_SITE_URL = 'https://tripbuddy-multiagent-travel-planner-1.onrender.com'

function getSiteOrigin() {
  const fromEnv = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '')
  }
  return PRODUCTION_SITE_URL
}

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`)
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
}

function upsertJsonLd(id, data) {
  let script = document.getElementById(id)
  if (!script) {
    script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = id
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(data)
}

/**
 * Updates document title and social/SEO meta tags for the current route.
 * Safe to call from page components — does not touch app business logic.
 */
export function applyPageSeo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = '/og-image.jpg',
  type = 'website',
  jsonLd = null,
}) {
  const origin = getSiteOrigin()
  const fullTitle = title.includes('TripBuddy') ? title : `${title} · TripBuddy AI`
  const url = origin ? `${origin}${path.startsWith('/') ? path : `/${path}`}` : path
  const imageUrl = image.startsWith('http') ? image : origin ? `${origin}${image}` : image

  document.title = fullTitle

  upsertMeta('meta[name="description"]', {
    name: 'description',
    content: description,
  })

  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle })
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
  upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type })
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url })
  upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl })
  upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'TripBuddy AI' })

  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle })
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl })

  if (origin) {
    upsertLink('canonical', url)
  }

  if (jsonLd) {
    upsertJsonLd('tripbuddy-jsonld', jsonLd)
  }
}

export { DEFAULT_DESCRIPTION, getSiteOrigin }
