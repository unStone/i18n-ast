const fs = require('fs');
const generator = require('babel-generator')
const translateTo = require('./translateTo')

const filePath = (name) => `${__dirname}/test/test${name || ""}.jsx`;

var {
  ast,
} = translateTo(filePath())
console.log('ast', ast)

const output = generator.default(ast.ast);
console.log('output', output)
fs.writeFileSync(filePath('-s'), output.code, { encoding: "utf-8" })
