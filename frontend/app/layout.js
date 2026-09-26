import './globals.css'
import { Providers } from './providers'
import { Navbar } from '../src/components/layout/Navbar'
import { Footer } from '../src/components/layout/Footer'
import { CookieConsent } from '../src/components/CookieConsent'

export const metadata = {
    title: 'TripBuddy AI',
    description: 'Plan calmer trips with TripBuddy AI — a multi-agent travel planner for flights, hotels, weather, budgets, and reviewable itineraries.',
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
    openGraph: {
        title: 'TripBuddy AI',
        description: 'Plan calmer trips with TripBuddy AI — a multi-agent travel planner for flights, hotels, weather, budgets, and reviewable itineraries.',
        siteName: 'TripBuddy AI',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'TripBuddy AI',
        description: 'Plan calmer trips with TripBuddy AI — a multi-agent travel planner for flights, hotels, weather, budgets, and reviewable itineraries.',
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
                <Providers>
                    <div className="min-h-screen bg-[var(--sand)] text-[var(--ink)]">
                        <Navbar />
                        {children}
                        <Footer />
                        <CookieConsent />
                    </div>
                </Providers>
            </body>
        </html>
    )
}
