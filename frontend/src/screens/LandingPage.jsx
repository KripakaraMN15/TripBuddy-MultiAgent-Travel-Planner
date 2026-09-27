'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Hero } from '../components/landing/Hero'
import { AgentNetwork } from '../components/landing/AgentNetwork'
import { HowItWorks } from '../components/landing/HowItWorks'
import { TechnologySection } from '../components/landing/TechnologySection'
import { TripPreview } from '../components/landing/TripPreview'

export function LandingPage({ jsonLd }) {
    return (
        <main className="bg-[var(--sand)] text-[var(--ink)]">
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
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
                        href="/planner"
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
