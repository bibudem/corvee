import { console, inspect } from '../../../core'

export async function getPerformanceData(page, name) {
  if (typeof page === 'undefined') {
    return null;
  }

  async function logConsole(msg) {
    for (let i = 0; i < msg.args().length; ++i) {
      console.warn(`${i}: ${msg.args()[i]}`);
    }
  }

  page.on('console', logConsole)

  const perf = await page.evaluate(
    (name) => {
      var data;
      try {
        data = name ? window.performance.getEntriesByName(name) : window.performance.getEntries();
        data = JSON.stringify(data)
      } catch (error) {
        console.warn(`Failed to get ${name ? `window.performance.getEntriesByName(${name})` : 'window.performance.getEntries()'} from ${location.href}. Error: ${inspect(error)}`)
        return ''
      }
      return data
    }, name
  )

  page.removeListener('console', logConsole)

  return perf ? JSON.parse(perf) : perf;
}