import { ArrowRight, Check, Clock3, Network, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export function Hero() {
    return (
        <section className="relative overflow-hidden border-b border-slate-200/80 px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
            <div className="absolute inset-x-0 top-0 h-px bg-slate-200" />
            <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.03fr_0.97fr] lg:gap-16">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="text-left">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e4d4c7] bg-[#fbf4ed] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#8a5a3b]">
                        <Network className="h-3.5 w-3.5" />
                        LANGGRAPH · MCP · MULTI-AGENT AI · HITL
                    </div>
                    <h1 className="max-w-2xl text-5xl font-black leading-[0.88] tracking-[-0.085em] text-slate-950 sm:text-7xl lg:text-[6.5rem]">
                        YOUR NEXT<br />
                        JOURNEY.<br />
                        <span className="text-[#c66d3f]">PLANNED BY AI.</span>
                    </h1>
                    <p className="mt-7 max-w-lg text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                        TripBuddy AI coordinates a dedicated travel team to research flights, hotels, weather, budgets, and itineraries before a human reviews the draft plan.
                    </p>
                    <div className="mt-9 flex flex-wrap items-center gap-5">
                        <Link to="/planner" className="group inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(15,23,42,0.12)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#c66d3f] active:translate-y-0">
                            Start Planning
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <a href="#ai-team" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-[#c66d3f]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#c66d3f]" />
                            Meet your AI travel team
                        </a>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: 'easeOut', delay: 0.08 }} className="relative lg:pt-4">
                    <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-6">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(198,109,63,0.12),transparent_28%),radial-gradient(circle_at_right,_rgba(148,163,184,0.12),transparent_30%)]" />
                        <div className="relative space-y-5">
                            <div className="flex items-start justify-between rounded-2xl border border-slate-200 bg-[#f9f5f1] px-4 py-3.5">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Destination</p>
                                    <p className="mt-1 text-2xl font-black tracking-[-0.06em] text-slate-900">Tokyo</p>
                                    <p className="mt-1 text-xs text-slate-500">Bengaluru → Tokyo · 7 days</p>
                                </div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf4ed] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#3f6c5f]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3f6c5f]" />Live + AI</span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                                {[
                                    ['Flights', '₹32,400'],
                                    ['Hotels', '₹18,600'],
                                    ['Total budget', '₹64,000'],
                                ].map(([label, value]) => (
                                    <div key={label} className="rounded-2xl border border-slate-200 bg-white px-3 py-4 transition duration-200 hover:-translate-y-1 hover:border-[#d9b799]">
                                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
                                        <p className="mt-2 text-base font-extrabold tracking-[-0.04em] text-slate-900">{value}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="rounded-[24px] border border-slate-200 bg-[#f7f4f1] p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Route</p>
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><Clock3 className="h-3.5 w-3.5" /> Planning in progress</span>
                                </div>
                                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-5">
                                    <div className="absolute left-8 top-1/2 h-px w-[calc(100%-4rem)] -translate-y-1/2 bg-gradient-to-r from-[#d9b799] via-[#c66d3f] to-[#ccd5df]" />
                                    <div className="relative flex items-center justify-between text-xs font-semibold text-slate-500">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3e3d3] text-[#8a5a3b]">BLR</span>
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8ebef] text-slate-600">NRT</span>
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3e3d3] text-[#8a5a3b]">HND</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-1 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-[#c66d3f]" /> 5 agents researching</span>
                                <span className="inline-flex items-center gap-1.5 font-semibold text-[#3f6c5f]"><Check className="h-3.5 w-3.5" /> Guardrails passed</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
