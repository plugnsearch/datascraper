const processor = require('../src/processor')

module.exports = class DataScraper {
  constructor(mapping, helpers) {
    this.mapping = mapping
    this.helpers = helpers
  }

  parse($) {
    return Object.keys(this.mapping).reduce(
      (result, key) => ({
        ...result,
        [key]: processor(this.mapping[key], $, this.helpers)
      }),
      {}
    )
  }
}
