const fs = require('fs');
const mkdirp = require("mkdirp");
const parseArgv = require("./options");
const file = require('./file');
const translate = require('./translate');
const chalk = require('./chalk')

const randomStr = () => Math.random().toString(36).substr(2);

const { entry, output, exclude, randomFuc } = parseArgv(process.argv);
let allTranslateWords = {};

if(!fs.existsSync(output)) {
  mkdirp(output)
}

if(fs.existsSync(`${output}/zh_CN.js`)) {
  const defaultWords = {}
  let requireWords = {};
  try {
    requireWords = require(`${process.cwd()}/${output}/zh_CN.js`);
    Object.keys(requireWords).forEach(v => {
      defaultWords[requireWords[v]] = v
    })
  } catch(e) {
    console.log(e)
    // chalk.error(`${output}/zh_CN.js is not a module`)
  }
  Object.assign(allTranslateWords, defaultWords);
}

const translateFiles = file.getFiles({
  path: entry,
  exclude,
})

// 收集翻译单词 替换词语
translateFiles.forEach(filePath => {
  const output = translate({
    filePath,
    allTranslateWords,
    randomStr: randomFuc || randomStr
  })
  fs.writeFileSync(`${filePath}`, output.code, { encoding: "utf-8" })
  chalk.success(`${filePath} is success`)
})

let outputString = 'module.exports = {\n';

Object.keys(allTranslateWords).forEach(word => {
  outputString += `  '${allTranslateWords[word]}': '${word}',\n`
})

outputString += '}\n'

fs.writeFileSync(`${output}/zh_CN.js`, outputString, { encoding: "utf-8" })