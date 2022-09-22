import { console as logger, inspect } from '@corvee/core'

export async function getPerformanceData(resourceName, page) {
  if (typeof page === 'undefined') {
    return null;
  }

  async function logConsole(msg) {
    // Make sure that the messages we get are from our own code
    if (msg.type() === 'error' && msg.text().startsWith('[CORVEE]')) {
      const { url, lineNumber, columnNumber } = msg.location()
      const msg = msg.text().substring(9)
      logger[msg.type()](`[${url}] ${lineNumber}:${columnNumber} ${msg}`);
    }
  }

  page.on('console', logConsole)

  const perf = await page.evaluate(
    (resourceName) => {
      var data;
      try {
        data = resourceName ? window.performance.getEntriesByName(resourceName) : window.performance.getEntries();
        data = JSON.stringify(data)
      } catch (error) {
        console.error(`[CORVEE] Failed to get ${resourceName ? `window.performance.getEntriesByName(${resourceName})` : 'window.performance.getEntries()'} from ${location.href}. Error: ${error}, ${error.stack}`)
        return ''
      }
      return data
    }, resourceName
  )

  page.removeListener('console', logConsole)

  return perf ? JSON.parse(perf) : perf;
}