import { motion } from 'framer-motion'

const steps = [
    { title: 'Your request', copy: 'Describe the trip in plain language.' },
    { title: 'Guardrails', copy: 'We keep the brief travel-focused and safe.' },
    { title: 'Supervisor', copy: 'The right agents are chosen for your goals.' },
    { title: 'Specialists', copy: 'Flights, hotels, weather, and budget research.' },
    { title: 'Live tools', copy: 'MCP tools pull real search and weather signals.' },
    { title: 'Human review', copy: 'Approve the draft or ask for revisions.' },
    { title: 'Final plan', copy: 'A polished itinerary ready to use.' },
]

export function HowItWorks() {
    return (
        <section
            id="how-it-works"
            className="relative overflow-hidden border-y border-[var(--line)] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
        >
            <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: "url('/section-nature.jpg')" }}
                aria-hidden="true"
            />
            <div className="absolute inset-0 bg-[var(--sand)]/88" aria-hidden="true" />

            <div className="relative mx-auto max-w-6xl">
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                        7-stage agentic workflow
                    </p>
                    <h2 className="text-4xl font-extrabold tracking-[-0.04em] text-[var(--ink)] sm:text-5xl">
                        From a wish to a{' '}
                        <span className="font-serif italic font-medium text-[var(--accent)]">finished journey</span>.
                    </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.25 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="rounded-[26px] border border-white/60 bg-white/75 p-5 backdrop-blur-md"
                        >
                            <p className="font-serif text-3xl italic text-[var(--accent)]">
                                {String(index + 1).padStart(2, '0')}
                            </p>
                            <h3 className="mt-3 text-base font-bold tracking-[-0.02em] text-[var(--ink)]">
                                {step.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.copy}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
