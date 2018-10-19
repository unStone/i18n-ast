const fs = require('fs');
const mkdirp = require("mkdirp");
const file = require('./file');
const translate = require('./translate');
const chalk = require('./chalk')

module.exports = function (option) {
  const collectAndWrite = {
    option: option,

    _randomStr: () => Math.random().toString(36).substr(2),

    _existsSync: (path) => fs.existsSync(path),

    _getTranslateFiles: function () {
      return file.getFiles({
        path: this.option.entry,
        exclude: this.option.exclude,
      })
    },

    getExistWords: function(existWordsPath) {
      const defaultWords = {}
      let requireWords = {};
      try {
        requireWords = require(`${process.cwd()}/${existWordsPath}`);
        Object.keys(requireWords).forEach(v => {
          defaultWords[requireWords[v]] = v
        })
      } catch(e) {
        console.log(e)
        // chalk.error(`${output}/zh_CN.js is not a module`)
      }
      return defaultWords;
    },

    collect: function(allTranslateWords, filePath) {
      const output = translate({
        filePath,
        allTranslateWords,
        randomStr: this.option.randomFuc || this._randomStr
      })
      this.write(`${filePath}`, output.code, { encoding: "utf-8" })
      chalk.success(`${filePath} is success`)
    },

    reorganize: function(allTranslateWords) {
      let outputString = 'module.exports = {\n';

      Object.keys(allTranslateWords).forEach(word => {
        // TODO 单引号和双引号的一些问题
        // word = word.replace(/\\'/g, '\'').replace(/\'/g, '\\\'')
        outputString += `  '${allTranslateWords[word]}': \`${word}\`,\n`
      })
      
      outputString += '}\n'
      return outputString
    },

    write: function(path, content, option) {
      fs.writeFileSync(path, content, option)
    },

    start: function() {
      let allTranslateWords = {};

      if(!this._existsSync(this.option.output)) {
        mkdirp(this.option.output)
      }

      if(this._existsSync(`${this.option.output}/${this.option.mainJs}`)) {
        Object.assign(allTranslateWords, this.getExistWords(`${this.option.output}/${this.option.mainJs}`));
      }

      const translateFiles = this._getTranslateFiles()

      translateFiles.forEach(filePath => {
        this.collect(allTranslateWords, filePath);
      })

      const reorganizeContent = this.reorganize(allTranslateWords);

      this.write(`${this.option.output}/${this.option.mainJs}`, reorganizeContent, { encoding: "utf-8" });
    }
  }
  return collectAndWrite
}