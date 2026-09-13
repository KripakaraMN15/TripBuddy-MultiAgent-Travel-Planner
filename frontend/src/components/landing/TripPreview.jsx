import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export function TripPreview() {
    return (
        <section className="px-4 pb-8 pt-8 sm:px-6 lg:px-8 lg:pb-12">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] border border-[var(--line)] bg-[#1c1916] text-white shadow-[0_30px_80px_rgba(40,30,20,0.18)]">
                <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="p-8 sm:p-10 lg:p-12">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d4a48a]">
                            Trip preview
                        </p>
                        <h2 className="mt-4 max-w-md text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">
                            A polished plan,{' '}
                            <span className="font-serif italic font-medium text-[#e8c4ad]">ready to review</span>.
                        </h2>
                        <p className="mt-4 max-w-md text-sm leading-7 text-white/65">
                            See how TripBuddy shapes flights, stays, weather, and a day-by-day rhythm into one clear
                            draft before you approve it.
                        </p>
                        <Link
                            to="/planner"
                            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5"
                        >
                            Start planning
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="relative min-h-[280px] bg-cover bg-center p-6 sm:p-8 lg:min-h-full"
                        style={{ backgroundImage: "url('/section-nature.jpg')" }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                        <div className="relative mt-auto flex h-full flex-col justify-end">
                            <div className="rounded-[24px] border border-white/20 bg-white/15 p-5 backdrop-blur-xl">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
                                    Tokyo · 7 days
                                </p>
                                <h3 className="mt-2 font-serif text-3xl italic text-white">Food, neighborhoods, calm evenings</h3>
                                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/85">
                                    <span className="rounded-full bg-white/15 px-3 py-1.5">Flights researched</span>
                                    <span className="rounded-full bg-white/15 px-3 py-1.5">Weather-aware</span>
                                    <span className="rounded-full bg-white/15 px-3 py-1.5">Budget checked</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
