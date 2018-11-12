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

const merge = function(fileConfig, programConfig) {
  const opt = {};
  Object.keys(fileConfig).filter(key => fileConfig[key]).forEach(key => opt[key] = fileConfig[key]);
  Object.keys(programConfig).filter(key => programConfig[key]).forEach(key => opt[key] = programConfig[key]);
  return opt;
}

/**
 * 配置的参数从两个地方收集
 * 1、配置文件
 * 2、命令行中设置的参数
 * 
 * 如果两个地方都有设定相同的参数，那么以命令行中设定的参数为主
 **/
module.exports = function collect(fileConfig, programConfig) {
  const { locales, ...mergeConfig } = merge(fileConfig, programConfig);
  return {
    ...mergeConfig,
    ...getLocales(locales)
  }
}