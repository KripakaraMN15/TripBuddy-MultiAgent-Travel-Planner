import { motion } from 'framer-motion'
import { PlaneTakeoff } from 'lucide-react'
import { SiFastapi, SiLanggraph, SiModelcontextprotocol, SiPostgresql } from '@icons-pack/react-simple-icons'

const tools = [
    { name: 'LangGraph', icon: SiLanggraph },
    { name: 'MCP', icon: SiModelcontextprotocol },
    { name: 'FastAPI', icon: SiFastapi },
    { name: 'PostgreSQL', icon: SiPostgresql },
    { name: 'Travel APIs', icon: PlaneTakeoff },
]

export function TechnologySection() {
    return (
        <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-6xl">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                        Quiet power underneath
                    </p>
                    <h2 className="text-4xl font-extrabold tracking-[-0.04em] text-[var(--ink)] sm:text-5xl">
                        Real tools. One serene workflow.
                    </h2>
                    <p className="mt-4 text-base leading-7 text-[var(--muted)]">
                        The surface stays simple. Underneath, a disciplined stack keeps research grounded and ready for
                        human review.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-wrap items-center justify-center gap-3"
                >
                    {tools.map((tool) => (
                        <div
                            key={tool.name}
                            className="inline-flex items-center gap-3 rounded-full border border-[var(--line)] bg-white/80 px-5 py-3 text-[var(--ink)] shadow-sm"
                        >
                            <tool.icon size={18} color="currentColor" strokeWidth={1.8} />
                            <span className="text-sm font-semibold tracking-[-0.01em]">{tool.name}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
