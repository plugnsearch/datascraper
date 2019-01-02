const REGEX_CONSTANTS = /^\"(.*)\"$/
const REGEX_PIPE = /^\|>\W*(.*)$/

function outerHtml(elem, $) {
  return $.html(elem) // outerHTML
}

function getContent(elem, $) {
  return elem
    .map((i, e) => $(e).text())
    .get()
    .join('\n')
}

function processor(attrs, $, helpers) {
  const value = (Array.isArray(attrs) ? attrs : [attrs]).reduce(function(
    lastValue,
    attr
  ) {
    return subprocessor(attr, $, helpers, lastValue)
  },
  null)

  // If the value is an element still, we just take the inner text of it and return that
  if (typeof value === 'object' && typeof value.text === 'function') {
    return value.text()
  }
  return value
}

function subprocessor(attr, $, helpers, value) {
  let pipeArgs
  if (Array.isArray(attr)) {
    pipeArgs = attr.slice(1)
    attr = attr[0]
  }

  const constMatch = REGEX_CONSTANTS.exec(attr)
  if (constMatch) {
    return constMatch[1]
  }

  const pipeMatch = REGEX_PIPE.exec(attr)
  if (pipeMatch) {
    return helpers[pipeMatch[1]](value, pipeArgs, $)
  }

  value = value || $(attr)

  return value
}

module.exports = processor
