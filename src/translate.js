const fs = require('fs');
const babel = require("babel-core");
const generator = require('babel-generator')
const chalk = require('./chalk')

function translate ({filePath, option, allTranslateWords}) {
  const {
    plugin
  } = require('./plugin/plugin-i18n-jsx')(allTranslateWords);

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
  fs.writeFileSync(`${filePath}`, output.code, { encoding: "utf-8" })
  chalk.success(`${filePath} is success`)
}

module.exports = translate;