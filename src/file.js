const glob = require('glob');

module.exports = {
  getFiles({ path, exclude }) {
    return glob.sync(`${path}/**/*.{js,jsx}`, {
      ignore: (exclude || []).map(e => `${path}/${e}`)
    })
  },

  getALayerFiles({ path, exclude }) {
    return glob.sync(`${path}/*.js`, {
      ignore: (exclude || []).map(e => `${path}/${e}`)
    })
  }
}