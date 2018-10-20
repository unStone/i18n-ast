const util = require('../src/util/index');

const testObj = {
  invert: {
    func: 'toEqual',
    input: {
      "key": "value",
      "simple": "multiple",
    },
    outPut: {
      "value": "key",
      "multiple": "simple",
    },
  }
}

Object.keys(testObj).forEach(key => {
  test(key, () => {
    expect(util[key](testObj[key].input))[testObj[key].func || 'tobe'](testObj[key].outPut) // 测试成功
  })
});