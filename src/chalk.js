const chalk = require('chalk');

module.exports = {
  warning: (msg) => console.log(chalk.rgb(250, 173, 20)(msg)),
  success: (msg) => console.log(chalk.rgb(0, 200, 0)(msg)),
  error: (msg) => console.log(chalk.rgb(255, 0, 25)(msg)),
}