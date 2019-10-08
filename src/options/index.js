#! /usr/bin/env node

const cwdPath = process.cwd();
const program = require('commander');
const fs = require('fs');
const { chalkErrorAndExit } = require('../util/chalk');
const package = require(`${cwdPath}/package.json`);

program.version(package.version)
// 只有命令行可配置的
program.option('-c, --config [path]', '配置文件地址（默认地址为根目录下 i18n-ast.config.js）')

// 只有配置文件都可配置的

// 命令行及配置文件都可配置的
program.option('-e, --entry [path]', '提取翻译词条的目录')
program.option('-o, --output [path]', '翻译词条导出的目录')
program.option('-p, --pack', '将翻译文件整理为 excel，需要配置"output"参数')
program.option('-x, --exclude [path]', '工作目录下需要排除的文件（多个文件请用","分割）')
program.option('-l, --locales [localeNames]', '需要翻译的语种的名字，请将中文文件名放在第一个，如有多个请用","分割，例如 "zh_CN,pt_PT,en_US"')

module.exports = function parseArgv(args) {
  program.parse(args);
  const programOption = program.opts();
  let configurationFileOptions = {};

  const configPath = `${cwdPath}/${programOption.config || 'i18n-ast.config.js'}`

   // 读取 i18n-ast.config.js 中设置的参数，然后并入 options 
  if(fs.existsSync(configPath)) {
    try {
      configurationFileOptions = require(configPath)
    } catch(err) {
      chalkErrorAndExit(`请检查 ${configPath} 配置文件是否正确\n`);
    }
  } else {
    chalkErrorAndExit(`${configPath} 预期配置文件不存在\n`);
  }

  const options = require('./collectOptions.js')(configurationFileOptions, programOption)

  // 检测 options 是否符合预期
  require('./detection.js')(options)
  
  return options
}
