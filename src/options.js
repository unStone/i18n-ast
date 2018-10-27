#! /usr/bin/env node

const program = require('commander');
const fs = require('fs');
const chalk = require('./chalk');
const option = require('../package.json');

const cwdPath = process.cwd();

const programParameter = ['entry', 'output', 'exclude', 'pack', 'locales'];

program.version(option.version)
program.option('-e, --entry [path]', '提取翻译词条的目录')
program.option('-o, --output [path]', '翻译词条导出的目录')
program.option('-x, --exclude [path]', '工作目录下需要排除的文件（多个文件请用","分割）')
program.option('-l, --locales [localeNames]', '需要翻译的语种的名字，请将中文文件名放在第一个，如有多个请用","分割，例如 "zh_CN,pt_PT,en_US"')
program.option('-p, --pack', '将翻译文件整理为 excel，需要配置"output"参数')

// 是否需要判断翻译目录
const needJudgeEntry = function(program, options) {
  return !program.pack && !options.pack
}

// 判断翻译目录是否有问题
const isEntryError = function(program, options) {
  return needJudgeEntry(program, options) &&
        (!program.entry || program.entry === true) &&
        !options.entry 
}

// 判断翻译目录是否有问题
const isOutputError = function(program, options) {
  return (!program.output || program.output === true) &&
        !options.output 
}

const getLocales = function(locales) {
  const defaultLocalObj = {
    mainLocal: 'zh_CN',
    otherLocales: [],
  }
  const dealWithArrayLocales = function(arrayLocales) {
    const newLocales = JSON.parse(JSON.stringify(arrayLocales));
    const mainLocal = newLocales.shift();
    return {
      mainLocal,
      otherLocales: newLocales,
    }
  }

  if(!locales) {
    return defaultLocalObj
  }

  if(typeof locales === 'string') {
    return dealWithArrayLocales(locales.split(','))
  }

  if(Array.isArray(locales)) {
    return dealWithArrayLocales(locales)
  }
}

module.exports = function parseArgv(args) {
  program.parse(args);
  const programOption = program.opts();
  const options = {}

  /**
   * 配置的参数从两个地方收集
   * 1、根目录下的 i18n-ast.config.js 文件
   * 2、命令行中设置的参数
   * 
   * 如果两个地方都有设定相同的参数，那么以命令行中设定的参数为主
   **/

   // 读取 i18n-ast.config.js 中设置的参数，然后并入 options 
  if(fs.existsSync(`${cwdPath}/i18n-ast.config.js`)) {
    let configurationFile = {};
    try {
      configurationFile = require(`${cwdPath}/i18n-ast.config.js`)
    } catch(err) {
      chalk.error('请检查 i18n-ast.config.js 配置文件是否正确\n')
    }

    Object.assign(options, configurationFile)
  }

  // 处理 locales 参数
  Object.assign(options, getLocales(options.locales))

  // 提取翻译词条目录报错
  if(isEntryError(program, options)) {
    chalk.error(`\n · 使用 -e [path] 或 --entry [path] 命令增加需要工作的目录`)
    chalk.error(` · 或在 i18n-ast.config.js 文件中设置 'entry' 字段\n`)
    process.exit(2);
  }

  // 输出词条目录报错
  if(isOutputError(program, options)) {
    chalk.error(`\n · 使用 -o [path] 或 --output [path] add 命令增加文字导出的目录`)
    chalk.error(` · 或在 i18n-ast.config.js 文件中设置 'output' 字段\n`)
    process.exit(2);
  }

  if(!Object.keys(programOption).length) {
    return options
  }
  
  // 处理命令行参数
  programParameter.forEach(k => {
    const value = programOption[k];
    if(value) {
      if(k === 'exclude') {
        options[k] = value.split(',')
      } else if(k === 'locales') {
        Object.assign(options, getLocales(value))
      } else {
        options[k] = value
      }
    }
  })
  
  return options
}
