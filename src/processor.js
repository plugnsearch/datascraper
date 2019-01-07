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
  const flags = {}
  const value = (Array.isArray(attrs) ? attrs : [attrs]).reduce(function(
    lastValue,
    attr
  ) {
    return subprocessor(attr, $, helpers, lastValue, flags)
  },
  null)

  // If the value is an element still, we just take the inner text of it and return that
  if (typeof value === 'object' && typeof value.text === 'function') {
    if (flags.array) {
      return value.map((i, el) => $(el).text()).get()
    } else {
      return value.text()
    }
  }
  return value
}

function subprocessor(attr, $, helpers, value, flags) {
  let pipeArgs
  if (Array.isArray(attr)) {
    pipeArgs = attr.slice(1)
    attr = attr[0]
  }

  if (attr[0] === '!') {
    flags[attr.slice(1)] = true
    return value
  }

  const constMatch = REGEX_CONSTANTS.exec(attr)
  if (constMatch) {
    return constMatch[1]
  }

  const pipeMatch = REGEX_PIPE.exec(attr)
  if (pipeMatch) {
    if (!helpers[pipeMatch[1]]) {
      throw new Error(
        `There is no helper called "${pipeMatch[1]}" defined. Please define one`
      )
    }
    if (flags.array && value.length) {
      return value
        .map(function(i, v) {
          return helpers[pipeMatch[1]]($(this), pipeArgs, $)
        })
        .get()
    }
    return helpers[pipeMatch[1]](value, pipeArgs, $)
  }

  value = value || $(attr)

  return value
}

module.exports = processor
