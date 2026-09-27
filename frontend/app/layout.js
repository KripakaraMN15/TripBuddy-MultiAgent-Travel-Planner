import './globals.css'
import { Navbar } from '../src/components/layout/Navbar'
import { Footer } from '../src/components/layout/Footer'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tripbuddy-multiagent-travel-planner-1.onrender.com'
const DESCRIPTION = 'Plan calmer trips with TripBuddy AI — a multi-agent travel planner for flights, hotels, weather, budgets, and reviewable itineraries.'

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
