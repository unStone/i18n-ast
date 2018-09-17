#! /usr/bin/env node

const program = require('commander');
const path = require('path');
const fs = require('fs');
const chalk = require('./chalk');
const option = require('../package.json');

const cwdPath = process.cwd();

const key = ['entry', 'output', 'exclude']

program.version(option.version)
program.option('-e, --entry [path]', '需要工作的目录')
program.option('-o, --output [path]', '翻译文字导出的目录')
program.option('-x, --exclude [path]', '工作目录下需要排除的文件（多个文件请用 , 分割）')

module.exports = function parseArgv(args) {
  program.parse(args);

  const options = {}

  if(fs.existsSync(`${cwdPath}/i18n-ast.config.js`)) {
    /**
     * i18n-ast.config.js 配置参数
     * entry 需要工作的目录
     * output 翻译文字导出的目录
     * exclude 排除的文件
     */ 
    const configurationFile = require(`${cwdPath}/i18n-ast.config.js`)
    Object.assign(options, configurationFile)
  }

  if((!program.entry || program.entry === true) && !options.entry) {
    chalk.error(`\n · 使用 -e [path] 或 --entry [path] 命令增加需要工作的目录`)
    chalk.error(` · 或在 i18n-ast.config.js 文件中设置 'entry' 字段\n`)
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
      if(k === 'exclude') {
        options[k] = program.opts()[k].split(',')
      } else {
        options[k] = program.opts()[k]
      }
    }
  })
  
  return options
}
