import { Hero } from '../components/landing/Hero'
import { AgentNetwork } from '../components/landing/AgentNetwork'
import { HowItWorks } from '../components/landing/HowItWorks'
import { TechnologySection } from '../components/landing/TechnologySection'
import { TripPreview } from '../components/landing/TripPreview'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function LandingPage() {
    return (
        <main className="bg-[#f8f4ee] text-slate-900">
            <Hero />
            <AgentNetwork />
            <HowItWorks />
            <TechnologySection />
            <TripPreview />
            <section className="px-4 pb-16 pt-4 sm:px-6 lg:px-8 lg:pb-24">
                <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[30px] border border-[#dfcdbb] bg-[#f1e2d4] px-6 py-8 sm:flex-row sm:items-center sm:px-10 sm:py-9">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9d6a4b]">Ready when you are</p>
                        <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] text-slate-950 sm:text-4xl">Your next trip starts here.</h2>
                    </div>
                    <Link to="/planner" className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#c66d3f]">
                        Start Planning
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </section>
        </main>
    )
}
