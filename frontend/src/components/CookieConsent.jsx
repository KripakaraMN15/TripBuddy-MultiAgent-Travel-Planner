import { useEffect, useState } from 'react'

const COOKIE_KEY = 'tripbuddy-cookie-consent'

export function CookieConsent() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem(COOKIE_KEY)
        setVisible(consent !== 'accepted')
    }, [])

    function acceptCookies() {
        localStorage.setItem(COOKIE_KEY, 'accepted')
        setVisible(false)
    }

    if (!visible) {
        return null
    }

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--line)] bg-[#1c1916]/95 px-4 py-4 text-white shadow-[0_-12px_35px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="max-w-3xl">
                    <p className="text-sm font-semibold text-white">Your privacy matters</p>
                    <p className="mt-1 text-sm leading-6 text-white/75">
                        We use cookies only to keep the planner experience smooth and remember your latest trip thread.
                        You can review our privacy policy and terms before proceeding.
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => setVisible(false)}
                        className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/90 transition hover:border-white/40 hover:text-white"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={acceptCookies}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1c1916] transition hover:bg-[#f5efe9]"
                    >
                        Accept cookies
                    </button>
                </div>
            </div>
        </div>
    )
}
