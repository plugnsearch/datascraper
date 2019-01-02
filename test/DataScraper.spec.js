/* eslint-env jest */
const cheerio = require('cheerio')

const DataScraper = require('../src/DataScraper')
const HTML = `
<html lang="en">
  <head>
    <meta name="foo" content="bar" />
    <meta name="foo" content="more bar" />
    <meta name="foo" content="baz" />
  </head>
  <body>
    <div class="some-class">
      <h1>My Stuff</h1>
      <p>content 1</p>
      <p class="joo">content <span>2</span></p>
      <p>content 3</p>
    </div>
  </body>
</html>
`

const METHODS = {
  attr: (elem, args) => elem.attr(args[0]),
  getText: elem => (elem.text ? elem.text() : cheerio.load(elem).text()),
  upper: str => (str.text ? str.text() : str).toUpperCase(),
  without: (elem, args, $) => {
    const scope = $(elem)
    let outerHTML = $.html(elem)
    args.forEach(selector => {
      outerHTML = outerHTML.replace($.html(scope.find(selector)), '')
    })

    return outerHTML.replace('', '')
  }
}

const MAPPING = {
  lang: ['html', ['|> attr', 'lang']],
  foo: ['[name=foo]', ['|> attr', 'content']],
  title: 'h1'
}

describe('DataScraper', () => {
  let $
  let scraper

  beforeAll(() => {
    $ = cheerio.load(HTML)
    scraper = new DataScraper(MAPPING, METHODS)
  })

  it('takes in a mapping and the cheerio instance and returns a JSON', () => {
    expect(scraper.parse($)).toEqual({
      lang: 'en',
      foo: 'bar',
      title: 'My Stuff'
    })
  })
})
