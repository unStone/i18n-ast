const fs = require('fs');
const file = require('../file');
const xlsx = require('xlsx');

EN = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

module.exports = function (option) {
  
  const excelPack = {

    option: option,

    getExistWords: function(existWordsPath) {
      let requireWords = {};
      try {
        requireWords = require(`${process.cwd()}/${existWordsPath}`);
      } catch(e) {
        console.log(e)
        // chalk.error(`${output}/zh_CN.js is not a module`)
      }
      return requireWords;
    },

    start: function() {
      const everLanguageWords = {};
      let allKeys = [];
      const sheet = {};

      const filesPath = file.getALayerFiles({ path: this.option.output });
      
      filesPath.forEach(filePath => {
        const fileName = filePath.split('/').pop();
        const keyValues = this.getExistWords(filePath);

        everLanguageWords[fileName] = keyValues;
        if(fileName === this.option.mainJs) {
          allKeys = Object.keys(keyValues)
        }
      })

      const filesName = filesPath.map(filePath => filePath.split('/').pop() )
      // https://segmentfault.com/a/1190000004395728

      var _headers = [].concat(['keys'], filesName)
      
      _headers.forEach((k, index) => sheet[`${EN[index]}1`] = { v: k })

      allKeys.forEach((eveyKey, rowIndex) => {
        sheet[`${EN[0]}${rowIndex + 2}`] = { v: eveyKey };
        filesName.forEach((fileName, colIndex) => {
          if(everLanguageWords[fileName] && everLanguageWords[fileName][eveyKey]) {
            sheet[`${EN[colIndex + 1]}${rowIndex + 2}`] = { v: everLanguageWords[fileName][eveyKey] || '' }
          }
        })
      })

      // 计算出范围
      const ref = `A1:${EN[_headers.length - 1]}${[allKeys.length + 1]}`;

      console.log('_headers', _headers, filesName)
      console.log('everLanguageWords', everLanguageWords, sheet)
      console.log('ref', ref)

      const workbook = {
        SheetNames: ['i18n-ast'],
        Sheets: {
          'i18n-ast': {
            '!ref': ref, // 必须要有这个范围才能输出，否则导出的 excel 会是一个空表
            ...sheet
          }
        }
      }

      console.log('workbook', workbook)

      xlsx.writeFile(workbook, `${this.option.output}/collect.xlsx`);
    }
  }
  return excelPack
}