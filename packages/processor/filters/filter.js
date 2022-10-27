/**
 * @typedef {object} FilterType
 * @property {string} code
 * @property {string} [description]
 * @property {import('corvee-processor').FilterLevelType} [level='error']
 * @property {boolean} [exclude=false]
 * @property {number} [priority=0]
 * @property {number} [matches=0]
 * @property {number} [limit=Infinity]
 * @property {(report: import('corvee-harvester').Report, filter?: FilterType) => string} test
 */

const defaultOptions = {
  level: 'error',
  exclude: false,
  priority: 0,
  limit: Infinity
}

export class Filter {

  /**
   * Creates an instance of Filter.
   * @param {string} code
   * @param {string} description
   * @param {object} options
   * @param {import('corvee-processor').FilterLevelType} [options.level='error']
   * @param {boolean} [options.exclude=false]
   * @param {number} [options.priority=0]
   * @param {number} [options.limit=Infinity] Limit the number of detections from this filter.
   * @memberof Filter
   */
  constructor(code, description, { level, exclude, priority, limit } = {}) {

    if (this.constructor === Filter) {
      throw new Error("This is an abstract class. It can't be instantiated.");
    }

    Object.defineProperties(this, {
      code: {
        value: code,
        writable: false,
        configurable: false,
        enumerable: true
      },
      description: {
        value: description,
        writable: false,
        configurable: false,
        enumerable: true
      }
    })

    this.level = level || defaultOptions.level
    this.exclude = exclude || defaultOptions.exclude
    this.priority = priority || defaultOptions.priority
    this.limit = limit || defaultOptions.limit

    Object.defineProperty(this, 'matches', {
      enumerable: false,
      writable: true,
      value: 0
    })
  }

  /**
   * @param {import('corvee-harvester').RecordType} record
   * @param {import('corvee-processor').FilterType} [filter]
   * @returns {import('corvee-harvester').RecordType | string | boolean | undefined}
   */
  test(record, filter) {
    throw new Error("Method 'test()' must be implemented.");
  }
}