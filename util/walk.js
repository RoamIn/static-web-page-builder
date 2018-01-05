const fs = require('fs')
const mimes = require('./mimes')

function walk (reqPath) {
  const files = fs.readdirSync(reqPath)
  const filesLen = files.length
  let dirList = []
  let fileList = []

  for (let i = 0; i < filesLen; i++) {
    const item = files[i]
    const itemArr = item.split('\.')
    const itemMime = itemArr.length > 1 ? itemArr[itemArr.length - 1] : 'undefined'

    if (typeof mimes[itemMime] === 'undefined') {
      dirList.push(item)
    } else {
      fileList.push(item)
    }
  }

  return dirList.concat(fileList)
}

module.exports = walk
