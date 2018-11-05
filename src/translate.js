const fs = require('fs');
const prettier = require("prettier");
const babel = require("babel-core");
const generator = require('babel-generator')

const middleRandomStr = (function(randomStr, ...argu) {
  return () => randomStr(...argu)
})

function translate ({filePath, option, allTranslateWords, randomStr}) {
  const arg = {
    translateWordsNum: 0,
    hasImportModule: false,
  }
  const plugin = require('./plugin/plugin-i18n-jsx')(allTranslateWords, middleRandomStr(randomStr, filePath), arg);

  const transformOptions = {
    sourceType: "module",
    // code: false,
    plugins: ["syntax-jsx", "syntax-class-properties",
    "syntax-object-rest-spread", 'syntax-decorators',
    'syntax-async-generators', "syntax-do-expressions",
    "syntax-dynamic-import", "syntax-export-extensions",
    "syntax-flow", "syntax-function-bind",
    "syntax-function-sent",
    plugin]
  }
  const bableObj = babel.transformFileSync(filePath, option || transformOptions)
  let { code, ast } = bableObj;
  console.log('arg', arg)
  const { translateWordsNum, hasImportModule } = arg;

  if(translateWordsNum !== 0) {
    code = generator.default(ast).code
  }
  console.log('hasImportModule', hasImportModule)
  if(!hasImportModule) {
    code = 'import intl from \'react-intl-universal\';\n' + code;
  }

  // const output = generator.default(bableObj.ast);
  // console.log('arg', arg)
  // console.log('output', output)

  return {
    code
  };
}

module.exports = translate;