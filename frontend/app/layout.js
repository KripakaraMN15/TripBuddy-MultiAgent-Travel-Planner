import './globals.css'
import { Navbar } from '../src/components/layout/Navbar'
import { Footer } from '../src/components/layout/Footer'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tripbuddy-multiagent-travel-planner-1.onrender.com'
const DESCRIPTION = 'Plan calmer trips with TripBuddy AI — a multi-agent travel planner for flights, hotels, weather, budgets, and reviewable itineraries.'

// The API is a separate Render service from this static site, so the browser
// needs to know where to send requests. NEXT_PUBLIC_* is inlined at build time,
// which makes the value impossible to correct without a full redeploy, so the
// value is also emitted as a meta tag that the client reads at runtime. A
// `postbuild` step rewrites the placeholder in the exported HTML, which lets a
// static host be repointed by editing a file instead of rebuilding.
const DEFAULT_API_BASE = 'https://tripbuddy-multiagent-travel-planner.onrender.com'

function resolveApiBase(siteUrl, configured) {
    const clean = (value) => (value || '').trim().replace(/\/+$/, '')

    const site = clean(siteUrl)
    const candidate = clean(configured) || DEFAULT_API_BASE

    // Pointing the API at the static site is the failure this guard exists for:
    // /api/travel returns the exported HTML there, which the client used to read
    // as an empty-but-successful response. Reject a value equal to the site.
    if (!candidate || candidate === site) {
        return DEFAULT_API_BASE
    }

    return candidate
}

const API_BASE_URL = resolveApiBase(SITE_URL, process.env.NEXT_PUBLIC_API_BASE_URL)

export const metadata = {
    // Set unconditionally so relative OG image URLs never resolve to localhost.
    metadataBase: new URL(SITE_URL),
    title: 'TripBuddy AI',
    description: DESCRIPTION,
    openGraph: {
        title: 'TripBuddy AI',
        description: DESCRIPTION,
        siteName: 'TripBuddy AI',
        type: 'website',
        url: SITE_URL,
        images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'TripBuddy AI' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'TripBuddy AI',
        description: DESCRIPTION,
        images: ['/og-image.jpg'],
    },
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <meta name="api-base-url" content={API_BASE_URL} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Manrope:wght@400;500;600;700;800&display=swap"
                />
            </head>
            <body>
                <div className="min-h-screen bg-[var(--sand)] text-[var(--ink)]">
                    <Navbar />
                    {children}
                    <Footer />
                </div>
            </body>
        </html>
    )
}
