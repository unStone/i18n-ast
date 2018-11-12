const chalk = require('chalk');
const { isString, isArray } = require('./typeof.js');

const warning = (msg) => console.log(chalk.rgb(250, 173, 20)(msg));
const success = (msg) => console.log(chalk.rgb(0, 200, 0)(msg));
const error = (msg) => console.log(chalk.rgb(255, 0, 25)(msg));

const chalkErrorStr = function(chalkMsg) {
  if(isString(chalkMsg)) {
    error(chalkMsg);
    return true;
  }
  return false;
}

const chalkErrorArr = function(chalkMsg) {
  if(isArray(chalkMsg)) {
    chalkMsg.forEach(msg => {
      chalkErrorStr(msg)
    });
    return true;
  }
  return false;
}

const chalkErrorAndExit = function(chalkMsg, exitNum) {
  chalkErrorStr(chalkMsg);
  chalkErrorArr(chalkMsg);
  process.exit(exitNum || 2)
}

module.exports = {
  warning,
  success,
  error,
  chalkErrorAndExit
}