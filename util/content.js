const fs = require('fs')
const path = require('path')

const dir = require('./dir')
const file = require('./file')

async function content (ctx, fullStaticPath) {
  const reqPath = path.join(fullStaticPath, ctx.url)
  const exist = fs.existsSync(reqPath)
  let content = ''

  if (exist) {
    let stat = fs.statSync(reqPath)

    if (stat.isDirectory()) {
      content = dir(ctx.url, reqPath)
    } else {
      content = await file(reqPath)
    }
  } else {
    content = '404 Not Found'
  }

  return content
}

module.exports = content
