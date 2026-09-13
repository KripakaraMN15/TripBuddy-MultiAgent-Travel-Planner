import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'

export function TermsPage() {
    return (
        <main className="mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
            <Seo
                title="Terms & Conditions"
                description="Read the TripBuddy AI terms covering use of the travel planner, service limitations, and user responsibilities."
                path="/terms"
            />

            <article className="prose rounded-[32px] border border-[var(--line)] bg-white/80 p-6 shadow-[0_24px_80px_rgba(40,30,20,0.06)] backdrop-blur-xl sm:p-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Legal</p>
                <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-[var(--ink)]">Terms & Conditions</h1>

                <p>
                    By using TripBuddy AI, you agree to use the service for lawful travel planning and research purposes only.
                </p>

                <h2>Service overview</h2>
                <p>
                    TripBuddy AI generates travel recommendations, budgets, weather summaries, and itinerary drafts using AI
                    agents and external data sources. Outputs are informational and may require verification before booking.
                </p>

                <h2>Accuracy disclaimer</h2>
                <p>
                    Flight prices, hotel availability, weather conditions, and travel restrictions can change at any time.
                    Final bookings and decisions remain the responsibility of the user.
                </p>

                <h2>User responsibility</h2>
                <ul>
                    <li>Do not use the service for unlawful, abusive, or harmful requests.</li>
                    <li>Verify all critical details before confirming travel plans.</li>
                    <li>Provide accurate information when requesting itinerary support.</li>
                </ul>

                <h2>Intellectual property</h2>
                <p>
                    The TripBuddy AI platform, its design, and generated materials may be protected by intellectual property
                    rights. You may not republish or redistribute materials without authorization.
                </p>

                <h2>Changes</h2>
                <p>
                    We may update these terms from time to time. Continued use of the service indicates acceptance of the most
                    recent version.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link to="/privacy-policy" className="btn-ink inline-flex items-center rounded-full px-5 py-3 text-sm font-semibold">
                        Privacy policy
                    </Link>
                    <Link to="/" className="inline-flex items-center rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]">
                        Back home
                    </Link>
                </div>
            </article>
        </main>
    )
}
