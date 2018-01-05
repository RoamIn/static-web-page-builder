const MarkdownIt = require('markdown-it')

const md = new MarkdownIt({
  html: true,
  xhtmlOut: true,
  typographer: true,
  linkify: true
})