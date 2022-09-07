import { console as logger, inspect } from '../../../core'

export async function getPerformanceData(resourceName, page) {
  if (typeof page === 'undefined') {
    return null;
  }

  async function logConsole(msg) {
    const values = [];
    for (const arg of msg.args()) {
      values.push(await arg.jsonValue());
    }
    logger[msg.type()](...values);
  }

  page.on('console', logConsole)

  const perf = await page.evaluate(
    (resourceName) => {
      var data;
      try {
        data = resourceName ? window.performance.getEntriesByName(resourceName) : window.performance.getEntries();
        data = JSON.stringify(data)
      } catch (error) {
        console.error(`Failed to get ${resourceName ? `window.performance.getEntriesByName(${resourceName})` : 'window.performance.getEntries()'} from ${location.href}. Error: ${error}, ${error.stack}`)
        return ''
      }
      return data
    }, resourceName
  )

  page.removeListener('console', logConsole)

  return perf ? JSON.parse(perf) : perf;
}