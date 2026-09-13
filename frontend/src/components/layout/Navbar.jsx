import { Link, NavLink, useLocation } from 'react-router-dom'

const navItems = [
    { label: 'Home', to: '/' },
    { label: 'How it works', to: '/#how-it-works' },
    { label: 'AI team', to: '/#ai-team' },
    { label: 'Plan a trip', to: '/planner' },
]

export function Navbar() {
    const { pathname } = useLocation()
    const isHome = pathname === '/'

    return (
        <header
            className={
                isHome
                    ? 'absolute inset-x-0 top-0 z-50'
                    : 'sticky top-0 z-50 border-b border-[var(--line)] bg-[rgba(244,239,232,0.88)] backdrop-blur-xl'
            }
        >
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
                <Link to="/" className="group flex items-center gap-2.5 text-[var(--ink)]">
                    <img
                        src="/logo.png"
                        alt="TripBuddy"
                        className="h-10 w-10 rounded-2xl object-cover shadow-sm ring-1 ring-black/10 transition group-hover:scale-[1.03]"
                    />
                    <span className="font-serif text-2xl font-semibold tracking-[-0.02em]">TripBuddy</span>
                </Link>

                <nav className="hidden items-center gap-8 text-[13px] font-medium tracking-wide text-[var(--ink-soft)] md:flex">
                    {navItems.map((item) =>
                        item.to.startsWith('/#') ? (
                            <a
                                key={item.label}
                                href={item.to}
                                className="transition-colors hover:text-[var(--ink)]"
                            >
                                {item.label}
                            </a>
                        ) : (
                            <NavLink
                                key={item.label}
                                to={item.to}
                                className={({ isActive }) =>
                                    `transition-colors ${isActive ? 'text-[var(--ink)]' : 'hover:text-[var(--ink)]'}`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ),
                    )}
                </nav>

                <Link
                    to="/planner"
                    className="btn-ink hidden rounded-full px-5 py-2.5 text-[13px] font-semibold md:inline-flex"
                >
                    Start planning
                </Link>
            </div>
        </header>
    )
}
