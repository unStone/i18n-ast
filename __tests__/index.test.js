// const test = require('jest');
const translate = require('../src/translate');

const getCode = (filePath) => {
  return translate({
    filePath,
    allTranslateWords: {},
    randomStr: () => '1'
  }).code
}

const testObj = {
  'object-value 转换': {
    path: 'example/js/object.js',
    toBe: `const obj = { test: intl.get("1").d('测试') };`
  },
  '方法传参转换': {
    path: 'example/js/funcArgu.js',
    toBe: `test(intl.get("1").d('测试'));`
  },

  'react 属性转换': {
    path: 'example/jsx/jsxAttribute.js',
    toBe: `<a attr={intl.get("1").d('测试')}></a>;`
  },
  'reactText 转换': {
    path: 'example/jsx/jsxText.js',
    toBe: `<a>{intl.get("1").d('测试')}</a>;`
  },
  // 'jsxTemplate 转换': {
  //   path: 'example/jsx/jsxTemplate.js',
  //   toBe: `<a>{intl.get("1", { test: test }).d(\`测试\${test}测试\`)}</a>;;`
  // },
  

}

Object.keys(testObj).forEach(key => {
  test(key, () => {
    expect(getCode(testObj[key].path)).toBe(testObj[key].toBe) // 测试成功
  })
});