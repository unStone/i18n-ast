const cwdPath = process.cwd();
const { chalkErrorAndExit } = require('../util/chalk');

// 判断翻译目录是否有问题
const isEntryError = function(options) {
  return !options.pack && !options.entry
}

// 判断翻译目录是否有问题
const isOutputError = function(options) {
  return !options.output 
}

module.exports = function detection(options) {
  // 提取翻译词条目录报错
  if(isEntryError(options)) {
    chalkErrorAndExit([`\n · 使用 -e [path] 或 --entry [path] 命令增加需要工作的目录`, ` · 或在 ${cwdPath}/${options.config} 文件中设置 'entry' 字段\n`]);
  }

  // 输出词条目录报错
  if(isOutputError(options)) {
    chalkErrorAndExit([`\n · 使用 -o [path] 或 --output [path] add 命令增加文字导出的目录`, ` · 或在 ${cwdPath}/${options.config} 文件中设置 'output' 字段\n`]);
  }
}