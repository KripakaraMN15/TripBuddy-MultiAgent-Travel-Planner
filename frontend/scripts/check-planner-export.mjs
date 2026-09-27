/**
 * Verifies the exported planner page is not an empty shell.
 *
 * The regression: <Suspense fallback={null}> around a component using
 * useSearchParams() made Next.js skip static prerendering, so planner.html
 * shipped a header and footer with no <main> and no form. It only appeared
 * after hydration, which reads as a blank or broken page.
 */
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

let ok = true

function check(label, cond, detail = '') {
    if (!cond) ok = false
    console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${label}${detail ? ` (${detail})` : ''}`)
}

const dist = path.join(process.cwd(), 'dist')
const html = await readFile(path.join(dist, 'planner.html'), 'utf8')

// Strip scripts/styles so we only assert on server-rendered markup.
const visible = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')

const text = visible.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()

console.log('=== planner.html is prerendered, not a shell ===')
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

console.log('\n=== other routes still prerender ===')
const files = await readdir(dist, { withFileTypes: true })
const pages = files.filter((f) => f.isFile() && f.name.endsWith('.html')).map((f) => f.name)
for (const page of pages) {
    const raw = await readFile(path.join(dist, page), 'utf8')
    const vis = raw.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    check(`${page} has content`, vis.length > 200, `${vis.length} chars`)
}

console.log('\n=== API meta tag intact ===')
check('meta api-base-url present', /<meta name="api-base-url" content="https:\/\/tripbuddy-multiagent-travel-planner\.onrender\.com"/.test(html))

console.log(`\nRESULT: ${ok ? 'ALL PASS' : 'SOME FAILURES'}`)
process.exit(ok ? 0 : 1)
