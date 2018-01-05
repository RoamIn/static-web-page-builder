const http = require('http')        // Http服务器API
const fs = require('fs')            // 用于处理本地文件

const server = new http.Server()    // 创建新的HTTP服务器
const FILE_PATH = './serverPackage.json'
let port = 8000
let httpOpt
let dataConfig

fs.readFile(FILE_PATH, (err, data) => {
  if (err) {
    throw err
  }

  dataConfig = JSON.parse(data)
  httpOpt = dataConfig.config
  port = httpOpt.serverPort || port

  // 监听端口8000
  server.listen(port)

  start()
  console.log(`start port: ${ port }`)
})

function httpGet (url, request, callback) {
  let data = []
  const opt = {
    host: httpOpt.host,
    port: httpOpt.port,
    path: url,
    method: 'GET',
    headers: {
      cookie: request.headers.cookie
    }
  }
  const req = http.request(opt, res => {
    res.on('data', chunk => {
      data.push(chunk)
    })

    res.on('end', () => {
      data = (Buffer.concat(data)).toString()
      callback(data)
    })
  })

  req.on('error', error => {
    console.log(`problem with request: ${ error.message }`)
  })

  req.end()
}

function httpPost (url, request, postData, callback) {
  postDeal(url, request, callback, postData)
}

function jsonOut (response, data) {
  response.writeHead(200, {'Content-type': 'application/json; charset=UTF-8'})
  response.write(data)
  response.end()
}

function getType (endTag) {
  let type = null

  switch (endTag) {
    case 'html':
    case 'htm':
      type = 'text/html; charset=UTF-8'

      break
    case 'js':
      type = 'application/javascript; charset="UTF-8"'

      break
    case 'css':
      type = 'text/css; charset="UTF-8"'

      break
    case 'txt':
      type = 'text/plain; charset="UTF-8"'

      break
    case 'manifest':
      type = 'text/cache-manifest; charset="UTF-8"'

      break
    default:
      type = 'application/octet-stream'
  }

  return type
}

function postDeal (url, request, callback, postData) {
  let contentType = 'application/x-www-form-urlencoded'

  if (httpOpt.postControlAllow) {
    contentType = 'application/json'
  }

  let data = []
  const opt = {
    host: httpOpt.host,
    port: httpOpt.port,
    path: url,
    method: 'POST',
    headers: {
      'cookie': request.headers.cookie,
      'Content-Type': contentType,
      'Content-Length': postData.length
    }
  }

  const req = http.request(opt, res => {
    res.on('data', chunk => {
      data.push(chunk)
    })

    res.on('end', function () {
      data = (Buffer.concat(data)).toString()
      callback(data)
    })
  })

  req.on('error', error => {
    console.log(`problem with request: ${ error.message }`)
  })

  req.write(postData)
  req.end()
}

function getUrlObject (url, arg) {
  const object = dataConfig.dataList
  let result = false

  for (let i = 0; i < object.length; i++) {
    if (object[i].url.toLowerCase() === url.toLowerCase()) {
      result = object[i]
      break
    }
  }

  return result
}

function postQuery (url, request, callback) {
  let postdata = ''

  request.addListener('data', postchunk => {
    postdata += postchunk
  })
  request.addListener('end', () => {
    return callback(postdata)
  })

}

function start () {
  // 使用on方法注册时间处理
  server.on('request', (request, response) => {
    const url = require('url').parse(request.url)
    let method = ''

    if (url.pathname === '' || url.pathname === '/') {
      fs.readFile('./index.html', (error, content) => {
        if (error) {
          response.writeHead(404, {'Content-Type': 'text/plain; charset="UTF-8"'})
          response.write(err.message)
          response.end()
        } else {
          response.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'})
          response.write(content)
          response.end()
        }
      })

      return false
    }

    if (request.headers['x-requested-with'] && request.headers['x-requested-with'].toLowerCase() === 'xmlhttprequest') {
      method = request.method.toLowerCase()

      if (method === 'post') {
        postQuery(url.path, request, function (d) {
          debugHandle(method, url, response, request, d)
        })
      } else {
        debugHandle(method, url, response, request, url.query)
      }

      return false
    }

    let filename = url.pathname.substring(1)
    let type = getType(filename.substring(filename.lastIndexOf('.') + 1))

    fs.readFile(filename, function (err, content) {
      if (err) {
        response.writeHead(404, {'Content-Type': 'text/plain; charset="UTF-8"'})
        response.write(err.message)
        response.end()
      } else {
        response.writeHead(200, {'Content-Type': type})
        response.write(content)
        response.end()
      }
    })
  })
}

function debugHandle (method, url, response, request, arg) {
  let jsonData
  let urlObject

  if (httpOpt.debug) {
    urlObject = getUrlObject(url.pathname, arg)

    if (urlObject) {
      jsonData = JSON.stringify(urlObject.data)
    } else {
      jsonData = '{"msg": "nodata"}'
    }

    jsonOut(response, jsonData)

    return false
  }

  if (method === 'post') {
    httpPost(url.path, request, arg, function (data) {
      jsonOut(response, data)
    })
  } else {
    httpGet(url.path, request, function (data) {
      jsonOut(response, data)
    })
  }
}