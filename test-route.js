const fs = require('fs')
const Koa = require('koa')

const app = new Koa()

function render (page) {
  return new Promise((resolve, reject) => {
    const viewUrl = `./view/${page}`

    fs.readFile(viewUrl, 'binary', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

async function route (url) {
  let view = 'error.html'

  switch (url) {
    case '/':
      view = 'index.html'
      break
    default:
      break
  }

  const html = await render(view)

  return html
}

app.use(async ctx => {
  const url = ctx.request.url
  const html = await route(url)

  ctx.body = html
})

app.listen(8080)
console.log('[Server] is starting at port 8080')