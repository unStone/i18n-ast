const glob = require('glob');

module.exports = {
  getFiles({ path, exclude }) {
    return glob.sync(`${path}/**/*.{js,jsx}`, {
      ignore: (exclude || []).map(e => `${path}/${e}`)
    })
  }
}