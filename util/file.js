const fs = require('fs')

function file (filePath) {
  const content = fs.readFileSync(filePath, 'binary')

  return content
}

module.exports = file