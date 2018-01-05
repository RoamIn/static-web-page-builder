const url = require('url')
const fs = require('fs')

const walk = require('./walk')

function dir (url, reqPath) {
  const contentList = walk(reqPath)
  let html = `<url>`

  for(let [index, item] of contentList.entries()) {
    html = `${html}<li><a href="${url === '/' ? '' : url}/${item}">${item}</a>`
  }

  html = `${html}</url>`

  console.log(html)

  return html
}

module.exports = dir
