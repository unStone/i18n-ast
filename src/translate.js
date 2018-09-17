const fs = require('fs');
const babel = require("babel-core");
const generator = require('babel-generator')

function translate ({filePath, option, allTranslateWords, randomStr}) {
  const {
    plugin
  } = require('./plugin/plugin-i18n-jsx')(allTranslateWords, randomStr);

  const transformOptions = {
    sourceType: "module",
    code: false,
    plugins: ["syntax-jsx", "syntax-class-properties",
    "syntax-object-rest-spread", 'syntax-decorators',
    'syntax-async-generators', "syntax-do-expressions",
    "syntax-dynamic-import", "syntax-export-extensions",
    "syntax-flow", "syntax-function-bind",
    "syntax-function-sent",
    plugin]
  }
  const output = generator.default(babel.transformFileSync(filePath, option || transformOptions).ast);
  return output;
}

module.exports = translate;