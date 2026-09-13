import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const workflowStages = [
    'Request',
    'Guardrails',
    'Supervisor',
    'Specialists',
    'Live tools',
    'Human review',
    'Final plan',
]

export function Hero() {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')

    function handleSearch(event) {
        event.preventDefault()
        navigate('/planner', {
            state: { prompt: query.trim() },
        })
    }

    return (
        <section className="relative min-h-[100svh] overflow-hidden">
            <div
                className="absolute inset-0 scale-105 bg-cover bg-center"
                style={{ backgroundImage: "url('/hero-escape.jpg')" }}
                aria-hidden="true"
            />
            <div
                className="absolute inset-0 bg-gradient-to-b from-[#f6e9d8]/35 via-transparent to-[#f4efe8]"
                aria-hidden="true"
            />
            <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,248,240,0.18),transparent_55%)]"
                aria-hidden="true"
            />

            <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center justify-center px-4 pb-28 pt-28 text-center sm:px-6 lg:px-8">
                <motion.h1
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="max-w-3xl text-[2.6rem] font-extrabold leading-[1.05] tracking-[-0.04em] text-[var(--ink)] sm:text-6xl lg:text-[4.25rem]"
                >
                    The best place to plan your{' '}
                    <span className="font-serif italic font-medium text-[var(--accent)]">next escape</span>.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, ease: 'easeOut', delay: 0.16 }}
                    className="mt-5 max-w-xl text-base leading-7 text-[var(--ink-soft)] sm:text-lg"
                >
                    Feeling ready to explore? Tell TripBuddy where you want to go — our agents handle flights,
                    stays, weather, and your day-by-day plan.
                </motion.p>

                <motion.form
                    onSubmit={handleSearch}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.24 }}
                    className="mt-9 flex w-full max-w-xl items-center gap-2 rounded-full border border-white/70 bg-white/90 p-1.5 pl-4 shadow-[0_18px_50px_rgba(40,30,20,0.16)] backdrop-blur-xl"
                >
                    <Search className="h-4 w-4 shrink-0 text-[var(--muted)]" strokeWidth={1.8} />
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search for a destination…"
                        className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)] sm:text-[15px]"
                        aria-label="Search for a destination"
                    />
                    <button
                        type="submit"
                        className="btn-ink shrink-0 rounded-full px-5 py-3 text-sm font-semibold"
                    >
                        Plan Now
                    </button>
                </motion.form>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.4 }}
                    className="absolute bottom-8 left-0 right-0 px-4"
                >
                    <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        Built around a 7-stage agentic workflow
                    </p>
                    <a
                        href="#how-it-works"
                        className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 sm:gap-1.5"
                        aria-label="See the 7-stage agentic workflow"
                    >
                        {workflowStages.map((stage, index) => (
                            <span key={stage} className="contents">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/55 bg-white/55 px-2.5 py-1 text-[11px] font-semibold text-[var(--ink-soft)] backdrop-blur-md transition hover:bg-white/80 sm:text-xs">
                                    <span className="font-serif italic text-[var(--accent)]">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    {stage}
                                </span>
                                {index < workflowStages.length - 1 && (
                                    <span className="hidden text-[var(--muted)] sm:inline" aria-hidden="true">
                                        →
                                    </span>
                                )}
                            </span>
                        ))}
                    </a>
                </motion.div>
            </div>
        </section>
    )
}
