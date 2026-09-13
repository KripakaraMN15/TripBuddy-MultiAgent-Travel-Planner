import { Hero } from '../components/landing/Hero'
import { AgentNetwork } from '../components/landing/AgentNetwork'
import { HowItWorks } from '../components/landing/HowItWorks'
import { TechnologySection } from '../components/landing/TechnologySection'
import { TripPreview } from '../components/landing/TripPreview'
import { Seo } from '../components/Seo'
import { getSiteOrigin } from '../lib/seo'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function LandingPage() {
    const origin = getSiteOrigin()

    return (
        <main className="bg-[var(--sand)] text-[var(--ink)]">
            <Seo
                title="TripBuddy AI"
                description="Plan calmer trips with TripBuddy AI — a multi-agent travel planner for flights, hotels, weather, budgets, and reviewable itineraries."
                path="/"
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@type': 'WebApplication',
                    name: 'TripBuddy AI',
                    url: origin || undefined,
                    applicationCategory: 'TravelApplication',
                    description:
                        'A multi-agent travel planner that coordinates flights, hotels, weather, budgets, and itineraries with human review.',
                    offers: {
                        '@type': 'Offer',
                        price: '0',
                        priceCurrency: 'USD',
                    },
                }}
            />
            <Hero />
            <AgentNetwork />
            <HowItWorks />
            <TechnologySection />
            <TripPreview />
            <section className="px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pb-28">
                <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-[32px] border border-[var(--line)] bg-white/70 px-6 py-8 backdrop-blur-sm sm:flex-row sm:items-center sm:px-10 sm:py-10">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                            Ready when you are
                        </p>
                        <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-[var(--ink)] sm:text-4xl">
                            Your next escape starts here.
                        </h2>
                    </div>
                    <Link
                        to="/planner"
                        className="btn-ink group inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
                    >
                        Start planning
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </section>
        </main>
    )
}
