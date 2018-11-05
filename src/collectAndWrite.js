const fs = require('fs');
const mkdirp = require("mkdirp");
const file = require('./file');
const translate = require('./translate');
const chalk = require('./chalk')
const util = require('./util');

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
      let defaultWords = {}
      let requireWords = {};
      try {
        requireWords = require(`${process.cwd()}/${existWordsPath}`);
        defaultWords = util.invert(requireWords)
      } catch(e) {
        // chalk.error(`${output}/zh_CN.js is not a module`)
      }
      return {
        valueKey: defaultWords,
        keyValue: requireWords
      };
    },

    collect: function(allTranslateWords, filePath) {
      const { isRewriting, code } = translate({
        filePath,
        allTranslateWords,
        randomStr: this.option.randomFuc || this._randomStr
      })
      if(isRewriting) {
        this.write(`${filePath}`, code, { encoding: "utf-8" })
        chalk.success(`${filePath} is success`)
      }
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
      const outputMainLocalPath = (localName) => `${this.option.output}/${localName}.js`

      if(!this._existsSync(this.option.output)) {
        mkdirp(this.option.output)
      }

      if(this._existsSync(outputMainLocalPath(this.option.mainLocal))) {
        Object.assign(allTranslateWords, this.getExistWords(outputMainLocalPath(this.option.mainLocal)).valueKey);
      }

      const translateFiles = this._getTranslateFiles()

      translateFiles.forEach(filePath => {
        this.collect(allTranslateWords, filePath);
      })

      const reorganizeContent = this.reorganize(allTranslateWords);

      if(this.option.otherLocales) {
        this.option.otherLocales.forEach((localName) => {
          const path = outputMainLocalPath(localName);
          const allWords = util.invert(JSON.parse(JSON.stringify(allTranslateWords)))
          const existWords = this.getExistWords(path).keyValue;
          Object.assign(allWords, existWords);

          const content = this.reorganize(util.invert(allWords));
          this.write(path, content, { encoding: "utf-8" });
        })
      }
      this.write(outputMainLocalPath(this.option.mainLocal), reorganizeContent, { encoding: "utf-8" });
    }
  }
  return collectAndWrite
}