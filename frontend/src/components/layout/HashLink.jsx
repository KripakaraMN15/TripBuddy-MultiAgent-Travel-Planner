'use client'

import { useHashLink } from '../../lib/useHashLink'

/**
 * A same-page anchor that navigates client-side.
 *
 * Next's App Router has no built-in hash scrolling, so a plain <a href="/#id">
 * would force a full document reload whenever it is followed from a non-home
 * route. See src/lib/useHashLink.js.
 */
export function HashLink({ href, className, children }) {
    const handleHashLink = useHashLink()

    return (
        <a
            href={href}
            onClick={(event) => handleHashLink(event, href.slice(1))}
            className={className}
        >
            {children}
        </a>
    )
}
