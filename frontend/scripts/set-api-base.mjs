/**
 * Rewrites the API base URL inside the exported HTML.
 *
 * The static site and the API are separate Render services, so the API URL has
 * to be present in the built HTML. Reading NEXT_PUBLIC_API_BASE_URL at runtime
 * does not work because Next inlines NEXT_PUBLIC_* into the JavaScript bundle
 * during the build, so the only way to repoint a deployed static site is to
 * rebuild it. This script edits dist/ directly, so the URL can be changed by
 * editing a file on the host (or by setting API_BASE_URL for the build) without
 * a full Next build.
 *
 * Priority: API_BASE_URL env var > existing meta tag > bundled default.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const DIST = path.join(process.cwd(), 'dist')
const DEFAULT_API_BASE = 'https://tripbuddy-multiagent-travel-planner.onrender.com'

function normalize(url) {
    return url.trim().replace(/\/+$/, '')
}

async function htmlFiles(dir) {
    const found = []
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            found.push(...(await htmlFiles(full)))
        } else if (entry.name.endsWith('.html')) {
            found.push(full)
        }
    }
    return found
}

async function main() {
    let target = process.env.API_BASE_URL ? normalize(process.env.API_BASE_URL) : null

    if (!target) {
        // Reuse whatever the build already emitted so this script is a no-op
        // unless an explicit override is supplied.
        console.log('[set-api-base] API_BASE_URL not set; leaving built values untouched.')
        return
    }

    const files = await htmlFiles(DIST)
    let patched = 0

    for (const file of files) {
        const html = await readFile(file, 'utf8')
        const pattern = /(<meta\s+name="api-base-url"\s+content=")[^"]*(")/i

        if (!pattern.test(html)) {
            continue
        }

        await writeFile(file, html.replace(pattern, `$1${target}$2`), 'utf8')
        patched += 1
    }

    console.log(`[set-api-base] set API base to ${target} in ${patched} file(s).`)
}

main().catch((err) => {
    console.error('[set-api-base] failed:', err.message)
    process.exit(1)
})
