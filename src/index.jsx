#! /usr/bin/env node

const program = require('commander');
const option = require('../package.json');

program
  .version(option.version)
  .command('-s [path]', '需要工作的目录')
  .command('-t [path]', '翻译文字导出的目录')
  .command('-e', '根据翻译文字生成excel')
  .command('-b', '根据excel转换翻译文字')
  .parse(process.argv);