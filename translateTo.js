const fs = require('fs');
const babel = require("babel-core");
const t = require('@babel/types');

const transformOptions = {
  sourceType: "module",
  code: false,
  plugins: ["syntax-jsx", "syntax-class-properties", "syntax-object-rest-spread", 'babel-plugin-syntax-decorators', reactPlugin]
}

function translateTo (filePath, option) {
  // const fileContent = fs.readFileSync(filePath, { encoding:"utf-8" })
  return {
    ast: babel.transformFileSync(filePath, option || transformOptions),
  }
}

module.exports = translateTo;