import { Link } from 'react-router-dom'

export function Footer() {
    return (
        <footer className="border-t border-[var(--line)] bg-[#1c1916] text-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-14 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
                <div className="max-w-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <img
                            src="/logo.png"
                            alt="TripBuddy"
                            className="h-10 w-10 rounded-2xl object-cover ring-1 ring-white/15"
                        />
                        <span className="font-serif text-2xl font-semibold tracking-[-0.02em]">TripBuddy</span>
                    </div>
                    <p className="text-sm leading-7 text-white/60">
                        Plan smarter. Travel calmer. A multi-agent travel planner designed to feel as serene as the
                        destinations it recommends.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
                    <div>
                        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                            Product
                        </h3>
                        <ul className="space-y-2.5 text-sm text-white/70">
                            <li>
                                <Link to="/planner" className="transition hover:text-white">
                                    Plan a trip
                                </Link>
                            </li>
                            <li>
                                <a href="/#how-it-works" className="transition hover:text-white">
                                    How it works
                                </a>
                            </li>
                            <li>
                                <a href="/#ai-team" className="transition hover:text-white">
                                    AI team
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                            Legal
                        </h3>
                        <ul className="space-y-2.5 text-sm text-white/70">
                            <li>
                                <Link to="/privacy-policy" className="transition hover:text-white">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="transition hover:text-white">
                                    Terms & Conditions
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                            Technology
                        </h3>
                        <ul className="space-y-2.5 text-sm text-white/70">
                            <li>LangGraph</li>
                            <li>MCP</li>
                            <li>FastAPI</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10 py-6 text-center text-sm text-white/40">
                © 2026 TripBuddy AI
            </div>
        </footer>
    )
}
