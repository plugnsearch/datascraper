const processor = require('../src/processor')

module.exports = class DataScraper {
  constructor(mapping, helpers) {
    this.mapping = mapping
    this.helpers = helpers
  }

  parse($) {
    return this.process(this.mapping, $)
  }

  process(def, $) {
    return Object.keys(def).reduce(
      (result, key) =>
        Object.assign({}, result, {
          [key]:
            typeof def[key] === 'object' && !Array.isArray(def[key])
              ? this.process(def[key], $)
              : processor(def[key], $, this.helpers)
        }),
      {}
    )
  }
}
