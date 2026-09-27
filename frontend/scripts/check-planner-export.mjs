/**
 * Verifies the static export is actually servable.
 *
 * Two regressions this guards against:
 *
 * 1. <Suspense fallback={null}> around a component using useSearchParams() made
 *    Next.js skip static prerendering, so the planner page shipped with no
 *    <main> and no form. It only appeared after hydration, which reads as a
 *    blank or broken page.
 *
 * 2. A flat export emits planner.html, but every internal link points at the
 *    extensionless /planner. A static host resolves that against the filesystem,
 *    finds no such directory, and falls back to index.html, so "Plan a trip"
 *    silently rendered the home page. trailingSlash: true emits
 *    planner/index.html, which resolves everywhere.
 */
import { readFile, stat } from 'node:fs/promises'
import { readdir } from 'node:fs/promises'
import path from 'node:path'

let ok = true

function check(label, cond, detail = '') {
    if (!cond) ok = false
    console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${label}${detail ? ` (${detail})` : ''}`)
}

const dist = path.join(process.cwd(), 'dist')

// Resolve a route the way a static host does: /planner -> planner/index.html.
// Falling back to planner.html would hide regression 2 rather than catch it.
async function routeFile(route) {
    const candidates = [
        path.join(dist, route, 'index.html'),
        path.join(dist, `${route}.html`),
    ]
    for (const candidate of candidates) {
        try {
            if ((await stat(candidate)).isFile()) return candidate
        } catch {
            /* try the next candidate */
        }
    }
    return null
}

console.log('=== routes resolve as directories, not flat files ===')
for (const route of ['planner', 'terms', 'privacy-policy']) {
    const asDir = path.join(dist, route, 'index.html')
    let isDir = false
    try {
        isDir = (await stat(asDir)).isFile()
    } catch {
        isDir = false
    }
    check(`${route}/index.html exists`, isDir, 'a flat .html here means /' + route + ' will 404 or fall back to the home page')
}

const plannerFile = await routeFile('planner')
if (!plannerFile) {
    console.error(`\nRESULT: SOME FAILURES (no HTML found for /planner under ${dist})`)
    process.exit(1)
}
const html = await readFile(plannerFile, 'utf8')

// Strip scripts/styles so we only assert on server-rendered markup.
const visible = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')

const text = visible.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()

console.log('\n=== the planner page is prerendered, not a shell ===')
check('has <main>', visible.includes('<main'))
check('not header/footer only', !/^\s*TripBuddy Home/.test(text), text.slice(0, 46))
check('has the form button', visible.includes('Generate travel plan'))

check('has the textarea', /<textarea/i.test(visible))
check('has starter prompts', visible.includes('Plan a 7-day Tokyo'))
check('has the heading', /Plan smarter|Plan a trip/i.test(visible))
check('text is substantial', text.length > 300, `${text.length} chars`)

console.log('\n=== no null-fallback footgun left ===')
// Strip comments first: the file documents *why* Suspense is absent, and a
// naive substring match would flag that prose instead of real usage.
const wrapper = (await readFile('app/planner/PlannerPageClient.js', 'utf8'))
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
check('PlannerPageClient does not import Suspense', !/\bSuspense\b/.test(wrapper))
check('PlannerPageClient renders PlannerPage directly', /<PlannerPage\s*\/?>/.test(wrapper))

console.log('\n=== PlannerPage must not call useSearchParams ===')
const planner = (await readFile('src/screens/PlannerPage.jsx', 'utf8'))
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
check('no useSearchParams import', !/useSearchParams/.test(planner))
check('no next/navigation import', !/from ['"]next\/navigation['"]/.test(planner))

console.log('\n=== every route still prerenders ===')
for (const route of ['', 'planner', 'terms', 'privacy-policy']) {
    const file = await routeFile(route)
    if (!file) {
        check(`/${route} exists`, false, 'no index.html in the export')
        continue
    }
    const raw = await readFile(file, 'utf8')
    const vis = raw.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    check(`/${route} has content`, vis.length > 200, `${vis.length} chars`)
}
check('404 page exists', Boolean(await routeFile('404')))

// Assert on the emitted anchors rather than the source strings. Next rewrites
// <Link href="/planner"> to "/planner/" during the export, so the source is
// allowed to stay extensionless; what matters is the HTML the host serves.
console.log('\n=== exported anchors resolve on a static host ===')
const ROUTES = ['planner', 'terms', 'privacy-policy']
const badAnchors = []
for (const route of ['', ...ROUTES]) {
    const file = await routeFile(route)
    if (!file) continue
    const raw = await readFile(file, 'utf8')
    for (const m of raw.matchAll(/href="(\/(?:planner|terms|privacy-policy))([^"]*)"/g)) {
        if (!m[2].startsWith('/') && m[2] !== '') {
            badAnchors.push(`/${route} -> ${m[1]}${m[2]}`)
        }
    }
}
check('no extensionless route anchors in the export', badAnchors.length === 0, badAnchors.join(', '))

// router.push is not normalised by Next, so those call sites must be explicit.
console.log('\n=== programmatic navigation uses trailing slashes ===')
async function* walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) yield* walk(full)
        else if (/\.(jsx?|mjs)$/.test(entry.name)) yield full
    }
}
const badPushes = []
const sources = []
for (const dir of ['src', 'app']) {
    for await (const file of walk(dir)) sources.push(file)
}
for (const file of sources) {
    const raw = await readFile(file, 'utf8')
    for (const m of raw.matchAll(/(?:router\.push|redirect|revalidatePath)\(\s*[`'"]([^`'"]+)/g)) {
        const target = m[1]
        for (const route of ROUTES) {
            if (target === `/${route}` || target.startsWith(`/${route}?`)) {
                badPushes.push(`${path.relative(process.cwd(), file)} -> ${target}`)
            }
        }
    }
}
check('no extensionless router.push targets', badPushes.length === 0, badPushes.join(', '))

console.log('\n=== API meta tag intact ===')
check('meta api-base-url present', /<meta name="api-base-url" content="https:\/\/tripbuddy-multiagent-travel-planner\.onrender\.com"/.test(html))

// The sitemap is a static file, so nothing rewrites its URLs for it. An
// extensionless entry there points crawlers at the route that falls back to
// the home page.
console.log('\n=== sitemap advertises canonical URLs ===')
const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8')
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
const badLocs = locs.filter((u) => ROUTES.some((r) => new URL(u).pathname === `/${r}`))
check('no extensionless route in the sitemap', badLocs.length === 0, badLocs.join(', '))
for (const route of ROUTES) {
    check(`/sitemap lists /${route}/`, locs.some((u) => new URL(u).pathname === `/${route}/`))
}

console.log('\n=== extensionless routes redirect ===')
const redirects = await readFile(path.join(dist, '_redirects'), 'utf8').catch(() => '')
check('_redirects shipped', redirects.length > 0)
for (const route of ROUTES) {
    const rule = new RegExp(`^/${route}\\s+/${route}/\\s+301$`, 'm')
    check(`/${route} -> /${route}/ 301`, rule.test(redirects))
}

console.log(`\nRESULT: ${ok ? 'ALL PASS' : 'SOME FAILURES'}`)
process.exit(ok ? 0 : 1)
