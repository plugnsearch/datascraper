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

const HELPERS = {
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

describe('DataScraper', () => {
  let $

  beforeAll(() => {
    $ = cheerio.load(HTML)
  })

  it('takes in a mapping and the cheerio instance and returns a JSON', () => {
    const scraper = new DataScraper(
      {
        lang: ['html', ['|> attr', 'lang']],
        foo: ['[name=foo]', ['|> attr', 'content']],
        title: 'h1'
      },
      HELPERS
    )

    expect(scraper.parse($)).toEqual({
      lang: 'en',
      foo: 'bar',
      title: 'My Stuff'
    })
  })

  it('can create nested structures as well', () => {
    const scraper = new DataScraper(
      {
        lang: ['html', ['|> attr', 'lang']],
        article: {
          title: 'h1',
          text: '.joo'
        }
      },
      HELPERS
    )

    expect(scraper.parse($)).toEqual({
      lang: 'en',
      article: {
        title: 'My Stuff',
        text: 'content 2'
      }
    })
  })
})
