// Dev-only smoke test: renders every screen in jsdom to catch runtime errors.
// Run with: node smoke-test.mjs
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
})
global.window = dom.window
global.document = dom.window.document
global.localStorage = dom.window.localStorage
global.sessionStorage = dom.window.sessionStorage
global.HTMLElement = dom.window.HTMLElement
global.SVGElement = dom.window.SVGElement
global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }
window.ResizeObserver = global.ResizeObserver
window.scrollTo = () => {}
dom.window.HTMLElement.prototype.scrollIntoView = () => {} // not implemented in jsdom

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const React = (await import('react')).default
const { createRoot } = await import('react-dom/client')
const { flushSync } = await import('react-dom')
const { default: App } = await vite.ssrLoadModule('/src/App.jsx')
const { useStore } = await vite.ssrLoadModule('/src/store/useStore.js')

const root = createRoot(document.getElementById('root'))
const screens = [
  'landing', 'quick', 'profile', 'income', 'assets', 'pensions', 'lifestyle', 'goals',
  'risk', 'results', 'coach', 'scenarios', 'timeline', 'dashboard', 'recommendations', 'register',
]
let failed = 0
for (const s of screens) {
  try {
    flushSync(() => useStore.setState({ screen: s }))
    flushSync(() => root.render(React.createElement(App)))
    console.log(s.padEnd(16), 'OK ', document.getElementById('root').innerHTML.length, 'chars')
  } catch (e) {
    failed++
    console.log(s.padEnd(16), 'FAIL:', e.message)
  }
}
await vite.close()
process.exit(failed ? 1 : 0)
