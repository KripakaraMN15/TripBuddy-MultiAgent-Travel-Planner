import { motion } from 'framer-motion'

const steps = [
    'Your request',
    'Guardrails',
    'Supervisor',
    'Specialized agents',
    'MCP tools',
    'Human review',
    'Final plan',
]

export function HowItWorks() {
    return (
        <section className="border-y border-slate-200/80 bg-[#f5efe8] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-7xl">
                <div className="mb-12 max-w-2xl">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#c66d3f]">How it works</p>
                    <h2 className="text-4xl font-black tracking-[-0.06em] text-slate-950 sm:text-5xl">From request to final plan.</h2>
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-7 lg:gap-4">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: index * 0.08 }}
                            className="relative"
                        >
                            <div className="group h-full min-h-28 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_14px_30px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-1 hover:border-[#d9b799] hover:shadow-[0_18px_36px_rgba(15,23,42,0.07)]">
                                <div className="flex items-center justify-between"><div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c66d3f]">0{index + 1}</div>{index < steps.length - 1 && <span className="hidden text-[#c66d3f] lg:block">→</span>}</div>
                                <div className="mt-4 text-sm font-bold leading-5 text-slate-800">{step}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
