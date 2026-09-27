'use client'

import { useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'

/**
 * Navigate to a same-page anchor without triggering a full document reload.
 *
 * A plain `<a href="/#section">` forces the browser to re-download and re-boot
 * the whole app when clicked from any route other than the home page. This
 * pushes client-side instead, then scrolls the target into view.
 */
export function useHashLink() {
    const router = useRouter()
    const pathname = usePathname()

    return useCallback(
        (event, hash) => {
            event.preventDefault()
            const targetId = hash.replace(/^#/, '')

            if (pathname !== '/') {
                router.push(`/${hash}`)
                return
            }

            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })
            window.history.replaceState(null, '', hash)
        },
        [pathname, router]
    )
}
