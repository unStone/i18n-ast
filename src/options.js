#! /usr/bin/env node

const program = require('commander');
const path = require('path');
const fs = require('fs');
const chalk = require('./chalk');
const option = require('../package.json');

const cwdPath = process.cwd();

const key = ['entry', 'output']

program.version(option.version)
program.option('-e, --entry [path]', '需要工作的目录')
program.option('-o, --output [path]', '翻译文字导出的目录')

module.exports = function parseArgv(args) {
  program.parse(args);

  const options = {}

  if(fs.existsSync(`${cwdPath}/i18n-ast.config.js`)) {
    /**
     * i18n-ast.config.js 参数
     * entry 需要工作的目录
     * output 翻译文字导出的目录
     */ 
    const configurationFile = require(`${cwdPath}/i18n-ast.config.js`)()
    Object.assign(options, configurationFile)
  }

  if((!program.entry || program.entry === true) && !options.entry) {
    chalk.error(`\n 使用 -e [path] 或 --entry [path] 命令增加需要工作的目录`)
    chalk.error(`\n 或在 i18n-ast.config.js 文件中设置 'entry' 字段\n`)
    process.exit(2);
  }

  if((!program.output || program.output === true) && !options.output) {
    chalk.error(`\n · 使用 -o [path] 或 --output [path] add 命令增加文字导出的目录`)
    chalk.error(` · 或在 i18n-ast.config.js 文件中设置 'output' 字段\n`)
    process.exit(2);
  }

  if(!Object.keys(program.opts()).length) {
    return options
  }
  
  key.forEach(k => {
    if(program.opts()[k]) {
      options[k] = program.opts()[k]
    }
  })
  
  // mkdirp.sync(program.entry)
  return options
}
