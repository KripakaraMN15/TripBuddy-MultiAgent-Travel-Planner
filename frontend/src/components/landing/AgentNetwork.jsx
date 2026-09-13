import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2, CalendarDays, CloudSun, Network, Plane, Wallet } from 'lucide-react'

const agents = [
    {
        id: 'supervisor',
        name: 'Supervisor',
        role: 'Coordinates the plan',
        icon: Network,
        detail:
            'Reads your travel brief, runs input guardrails, extracts trip constraints, and routes work only to the specialist agents you actually need.',
    },
    {
        id: 'flight',
        name: 'Flight Agent',
        role: 'Routes & timing',
        icon: Plane,
        detail:
            'Looks up airport and airline signals through AviationStack MCP, then drafts practical flight guidance — likely airports, typical duration, and booking advice.',
    },
    {
        id: 'hotel',
        name: 'Hotel Agent',
        role: 'Places to stay',
        icon: Building2,
        detail:
            'Uses Tavily search to surface neighborhood-aware stay options that fit your destination, travel style, and budget cues.',
    },
    {
        id: 'weather',
        name: 'Weather Agent',
        role: 'Climate & packing',
        icon: CloudSun,
        detail:
            'Pulls current conditions and short-range forecasts from OpenWeather so the itinerary accounts for rain, heat, and packing needs.',
    },
    {
        id: 'budget',
        name: 'Budget Agent',
        role: 'Cost realism',
        icon: Wallet,
        detail:
            'Stress-tests the trip against your spend limit — highlighting risk areas, approximate cost buckets, and ways to keep the plan feasible.',
    },
    {
        id: 'itinerary',
        name: 'Itinerary Agent',
        role: 'Day-by-day flow',
        icon: CalendarDays,
        detail:
            'Merges every specialist finding into a clear draft itinerary ready for human review before the final polished response.',
    },
]

export function AgentNetwork() {
    const [activeId, setActiveId] = useState(agents[0].id)
    const activeAgent = agents.find((agent) => agent.id === activeId) || agents[0]
    const ActiveIcon = activeAgent.icon

    return (
        <section id="ai-team" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-6xl">
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                        Your AI travel team
                    </p>
                    <h2 className="text-4xl font-extrabold tracking-[-0.04em] text-[var(--ink)] sm:text-5xl">
                        Specialized agents,{' '}
                        <span className="font-serif italic font-medium text-[var(--accent)]">one calm plan</span>.
                    </h2>
                    <p className="mt-4 text-base leading-7 text-[var(--muted)]">
                        Hover or tap an agent to see exactly what it contributes to the workflow.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                    <div className="grid gap-3 sm:grid-cols-2">
                        {agents.map((agent, index) => {
                            const Icon = agent.icon
                            const isActive = activeId === agent.id

                            return (
                                <motion.button
                                    key={agent.id}
                                    type="button"
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.45, delay: index * 0.05 }}
                                    onMouseEnter={() => setActiveId(agent.id)}
                                    onFocus={() => setActiveId(agent.id)}
                                    onClick={() => setActiveId(agent.id)}
                                    aria-pressed={isActive}
                                    className={`group rounded-[26px] border p-5 text-left transition duration-300 ${
                                        isActive
                                            ? 'border-[var(--accent-soft)] bg-white shadow-[0_18px_48px_rgba(40,30,20,0.1)]'
                                            : 'border-[var(--line)] bg-white/70 hover:-translate-y-0.5 hover:border-[var(--accent-soft)]/60 hover:bg-white'
                                    }`}
                                >
                                    <div
                                        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ring-1 transition ${
                                            isActive
                                                ? 'bg-[var(--accent)] text-white ring-[var(--accent)]'
                                                : 'bg-[var(--sand)] text-[var(--ink)] ring-black/5 group-hover:bg-[var(--accent)] group-hover:text-white'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" strokeWidth={1.7} />
                                    </div>
                                    <h3 className="text-base font-bold tracking-[-0.03em] text-[var(--ink)]">
                                        {agent.name}
                                    </h3>
                                    <p className="mt-1 text-sm text-[var(--muted)]">{agent.role}</p>
                                </motion.button>
                            )
                        })}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.aside
                            key={activeAgent.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.28 }}
                            className="sticky top-28 rounded-[32px] border border-white/70 bg-[#1c1916] p-7 text-white shadow-[0_24px_60px_rgba(40,30,20,0.16)] sm:p-8"
                            aria-live="polite"
                        >
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-[#e8c4ad]">
                                <ActiveIcon className="h-6 w-6" strokeWidth={1.7} />
                            </div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d4a48a]">
                                Agent detail
                            </p>
                            <h3 className="mt-2 font-serif text-3xl italic sm:text-4xl">{activeAgent.name}</h3>
                            <p className="mt-2 text-sm font-medium text-white/55">{activeAgent.role}</p>
                            <p className="mt-5 text-base leading-7 text-white/80">{activeAgent.detail}</p>
                            <p className="mt-6 text-xs text-white/40">
                                Tip: hover desktop cards or tap on mobile to explore each role.
                            </p>
                        </motion.aside>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    )
}
