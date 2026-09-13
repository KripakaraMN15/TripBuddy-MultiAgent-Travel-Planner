import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'

export function PrivacyPolicyPage() {
    return (
        <main className="mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
            <Seo
                title="Privacy Policy"
                description="Learn how TripBuddy AI handles travel requests, usage data, and cookies."
                path="/privacy-policy"
            />

            <article className="prose rounded-[32px] border border-[var(--line)] bg-white/80 p-6 shadow-[0_24px_80px_rgba(40,30,20,0.06)] backdrop-blur-xl sm:p-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Legal</p>
                <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-[var(--ink)]">Privacy Policy</h1>

                <p>
                    TripBuddy AI respects your privacy. This policy explains how we handle the information you share when
                    using the planner, including your trip request, chat history, and browser metadata.
                </p>

                <h2>What we collect</h2>
                <ul>
                    <li>Trip details you enter in the planner.</li>
                    <li>Thread identifiers used to continue a planning session.</li>
                    <li>Basic browser metadata necessary to keep the site running.</li>
                    <li>Cookies used to remember consent and improve continuity.</li>
                </ul>

                <h2>How we use it</h2>
                <p>
                    We use your request to generate a personalized travel plan, coordinate the AI agents, and continue the
                    flow between user input and final itinerary generation.
                </p>

                <h2>Third-party services</h2>
                <p>
                    Travel planning may use external services such as OpenWeather, Tavily, and AviationStack to retrieve live
                    data. Those providers may process data according to their own privacy terms.
                </p>

                <h2>Storage and retention</h2>
                <p>
                    We keep data only as long as it is needed to provide the service. In production, retention and deletion
                    practices should be explicitly documented and enforced by the hosting provider and database policy.
                </p>

                <h2>Security</h2>
                <p>
                    We protect sensitive configuration, API keys, and environment settings from being exposed in frontend code
                    or source-controlled client files.
                </p>

                <h2>Contact</h2>
                <p>
                    If you have privacy questions, contact the site owner through the established support channel for the
                    deployed project.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link to="/terms" className="btn-ink inline-flex items-center rounded-full px-5 py-3 text-sm font-semibold">
                        Read terms
                    </Link>
                    <Link to="/" className="inline-flex items-center rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]">
                        Back home
                    </Link>
                </div>
            </article>
        </main>
    )
}
