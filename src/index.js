const parseArgv = require("./options");
const collectAndWrite = require('./collectAndWrite')
const excelPack = require('./excel-pack')

const option = parseArgv(process.argv);

console.log('option', option)

// 先收集再打包
const queue = [{
  type: 'collectAndWrite',
  params: ['entry', 'output'],
  do: () => collectAndWrite(option).start()
}, {
  type: 'excelPack',
  params: ['pack'],
  do: () => excelPack(option).start()
}]

queue.forEach(everLine => {
  const isDoIt = everLine.params.every(param => option[param]);
  if(isDoIt) everLine.do();
})
