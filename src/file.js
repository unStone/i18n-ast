const glob = require('glob');

module.exports = {
  getFiles({ path, exclude }) {
  console.log('(exclude || []).map(e => `${path}/${e}`)', (exclude || []).map(e => `${path}/${e}`))
  return glob.sync(`${path}/**/*.{js,jsx}`, {
      ignore: (exclude || []).map(e => `${path}/${e}`)
    })
  }
}