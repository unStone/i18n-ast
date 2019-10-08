const glob = require('glob');

module.exports = {
  getFiles({ path, exclude=[] }) {
    if(typeof exclude === 'string') exclude = exclude.split(',')
    return glob.sync(`${path}/**/*.{js,jsx}`, {
      ignore: (exclude || []).map(e => `${path}/${e}`)
    })
  },

  getALayerFiles({ path, exclude=[] }) {
    if(typeof exclude === 'string') exclude = exclude.split(',')
    return glob.sync(`${path}/*.js`, {
      ignore: (exclude || []).map(e => `${path}/${e}`)
    })
  }
}