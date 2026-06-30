export function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-[#f8f4ee]">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
                <div>
                    <div className="mb-4 flex items-center gap-3 text-slate-900">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3e3d3] text-[#c66d3f] ring-1 ring-[#d9b799]">
                            ✈
                        </span>
                        <span className="text-lg font-extrabold tracking-[-0.04em]">TripBuddy AI</span>
                    </div>
                    <p className="text-sm text-slate-600">Plan smarter.<br />Travel better.</p>
                </div>

                <div>
                    <h3 className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Product</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li>Plan a Trip</li>
                        <li>How It Works</li>
                        <li>AI Team</li>
                    </ul>
                </div>

                <div>
                    <h3 className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500">AI System</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li>Supervisor</li>
                        <li>Multi-Agent AI</li>
                        <li>MCP</li>
                        <li>Human-in-the-Loop</li>
                    </ul>
                </div>

                <div>
                    <h3 className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Technology</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li>FastAPI</li>
                        <li>LangGraph</li>
                        <li>MCP</li>
                        <li>PostgreSQL</li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
                © 2026 TripBuddy AI
            </div>
        </footer>
    )
}
