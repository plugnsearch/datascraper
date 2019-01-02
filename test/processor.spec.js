/* eslint-env jest */
const cheerio = require('cheerio')

const processor = require('../src/processor')
const HTML = `
<html>
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

describe('processor', () => {
  let $

  beforeAll(() => {
    $ = cheerio.load(HTML)
  })

  describe('fixed values', () => {
    it('can be defined', () => {
      expect(processor('"foo"')).toEqual('foo')
    })

    it('can be passed through pipes', () => {
      expect(processor(['"foo"', '|> upper'], $, METHODS)).toEqual('FOO')
    })

    it('spaces in pipes are optional', () => {
      expect(processor(['"foo"', '|>upper'], $, METHODS)).toEqual('FOO')
    })
  })

  describe('selectors', () => {
    it('will be evaluated using the given html', () => {
      expect(processor('h1', $)).toEqual('My Stuff')
    })

    it('will only return the text by default', () => {
      expect(processor('.joo', $)).toEqual('content 2')
    })

    it('value can be passed through pipes', () => {
      expect(processor(['.joo', '|> upper'], $, METHODS)).toEqual('CONTENT 2')
    })

    it('will return content of first matching element by default', () => {
      expect(
        processor(['[name=foo]', ['|> attr', 'content']], $, METHODS)
      ).toEqual('bar')
    })

    it('will return empty string if it does not have content', () => {
      expect(processor('[name=foo]', $, METHODS)).toEqual('')
    })

    it('piped methods can have arguments', () => {
      const result = processor(
        ['.some-class', ['|> without', 'h1', '.joo'], '|> getText'],
        $,
        METHODS
      )
      expect(result).not.toContain('My Stuff')
      expect(result).toContain('content 1')
      expect(result).not.toContain('Content 2')
      expect(result).toContain('content 3')
    })

    it('piped methods can be happily arranged', () => {
      const result = processor(
        ['.some-class', ['|> without', 'h1', '.joo'], '|> getText', '|> upper'],
        $,
        METHODS
      )
      expect(result).not.toContain('MY STUFF')
      expect(result).toContain('CONTENT 1')
      expect(result).not.toContain('CONTENT 2')
      expect(result).toContain('CONTENT 3')
    })
  })
})

// articleType: '"news"',
// image: ['[name="twitter:image:src"]', '[content]'],
// author: ['[name="author"]', '[content]'],
// createdAt: ['[name="date"]', '[content]'],
// canonicalUrl: ['meta[property="og:url"]', '[content]'],
// kyeywords: ['[name="keywords"]', '[content]'],
// lang: ['html', '[lang]'],
// title: '.meldungHead h1',
// updateAt: ['.meldungHead .stand', '|> extractTime'],
// article: {
//   find: '.sectionArticle',
//   subtract: ['.socialmediaembed', '.mediaCon', '.linklist', '.infokasten']
// }
