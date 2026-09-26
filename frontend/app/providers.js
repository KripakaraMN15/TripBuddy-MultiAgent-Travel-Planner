'use client'

import { useEffect } from 'react'

export function Providers({ children }) {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('travel_thread_id')
            if (saved) {
                sessionStorage.setItem('travel_thread_id', saved)
            }
        }
    }, [])

    return children
}
