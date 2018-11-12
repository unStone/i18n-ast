const isString = str => typeof str === 'string';

const isArray = Array.isArray || function(object){ return object instanceof Array }

module.exports = {
  isString,
  isArray
}