import { motion } from 'framer-motion'
import { PlaneTakeoff } from 'lucide-react'
import { SiFastapi, SiLanggraph, SiModelcontextprotocol, SiPostgresql } from '@icons-pack/react-simple-icons'

const tools = [
    { name: 'LangGraph', icon: SiLanggraph, color: '#1f2937' },
    { name: 'MCP', icon: SiModelcontextprotocol, color: '#c66d3f' },
    { name: 'FastAPI', icon: SiFastapi, color: '#009688' },
    { name: 'PostgreSQL', icon: SiPostgresql, color: '#336791' },
    { name: 'External Travel APIs', icon: PlaneTakeoff, color: '#8a5a3b' },
]

export function TechnologySection() {
    return (
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-7xl">
                <div className="mb-12 max-w-3xl">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#c66d3f]">Real-world tools. One AI workflow.</p>
                    <h2 className="text-4xl font-black tracking-[-0.06em] text-slate-950 sm:text-5xl">A connected system built around real data sources.</h2>
                    <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">The product layer stays simple. Underneath, a disciplined stack keeps research grounded, traceable, and ready for human review.</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"
                >
                    {tools.map((tool) => (
                        <div key={tool.name} className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition duration-200 hover:-translate-y-1 hover:border-[#d9b799]">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200 transition duration-200 group-hover:scale-105" style={{ color: tool.color }} aria-hidden="true">
                                <tool.icon size={22} color="currentColor" strokeWidth={1.8} />
                            </div>
                            <p className="text-lg font-bold tracking-[-0.04em] text-slate-900">{tool.name}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
