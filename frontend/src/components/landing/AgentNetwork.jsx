import { motion } from 'framer-motion'
import { Building2, CalendarDays, CloudSun, Network, Plane, Wallet } from 'lucide-react'

const agents = [
    { name: 'Supervisor', icon: Network, accent: 'bg-[#f3e3d3] text-[#8a5a3b]', primary: true },
    { name: 'Flight Agent', icon: Plane, accent: 'bg-[#eff3f8] text-slate-700' },
    { name: 'Hotel Agent', icon: Building2, accent: 'bg-[#f3e3d3] text-[#8a5a3b]' },
    { name: 'Weather Agent', icon: CloudSun, accent: 'bg-[#eef5f0] text-[#3f6c5f]' },
    { name: 'Budget Agent', icon: Wallet, accent: 'bg-[#f7f0e8] text-[#9d6a4b]' },
    { name: 'Itinerary Agent', icon: CalendarDays, accent: 'bg-[#eef1f8] text-slate-700' },
]

export function AgentNetwork() {
    return (
        <section id="ai-team" className="scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-7xl">
                <div className="mb-12 max-w-2xl">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#c66d3f]">Your AI travel team</p>
                    <h2 className="text-4xl font-black tracking-[-0.06em] text-slate-950 sm:text-5xl">Specialized agents, working as one trip planner.</h2>
                    <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">One supervisor turns your brief into a coordinated research pass, then brings every finding back into a single, reviewable plan.</p>
                </div>

                <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(198,109,63,0.06),transparent_32%)]" />
                    <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-10">
                        {agents.map((agent, index) => {
                            const Icon = agent.icon
                            return (
                                <motion.div
                                    key={agent.name}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.38, delay: index * 0.08 }}
                                    className={`group relative flex flex-col items-center gap-3 ${agent.primary ? 'lg:min-w-40' : 'lg:flex-1'}`}
                                >
                                    {!agent.primary && <div className="absolute -top-5 left-1/2 h-5 w-px bg-[#d9b799] lg:-left-5 lg:top-8 lg:h-px lg:w-5" aria-hidden="true" />}
                                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${agent.accent} ring-1 ring-slate-200 transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)]`}>
                                        <Icon className="h-7 w-7" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{agent.name}</span>
                                    {agent.primary && <span className="rounded-full bg-[#f3e3d3] px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#8a5a3b]">Coordinates the plan</span>}
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
