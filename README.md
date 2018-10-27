# i18n-ast

## Install

使用 npm:

```sh
npm install --save-dev i18n-ast
```

or using yarn:

```sh
yarn add i18n-ast --dev
```

## Use
共有两种办法执行 i18n-ast

需要转换的文件路径
输出的文件路径是必填的

1. 利用命令行
```sh
  i18n-ast -e [path] -o [path] -x [path]
```

2. 在根目录下新建配置文件 i18n-ast.config.js
```js
module.exports = () => ({
  entry: "需要转换的文件路径",
  output: "输出的文件路径",
   //排除的文件（类型是数组） 
  exclude: [],
  //可以自定义随机字符串，第一个参数是当前文件的路径
  randomFuc: (filePath) => `${filePath.split('/').pop()}-${Math.random()}`
})
```

## Todo List
- [ ] 替换情况
  - js
    - [x] 对象中的中文字符串
    - [x] 方法中的中文传参
    - [x] 模板字符串（包含简单变量）
  - react
    - [x] react中的中文属性
    - [x] react中的中文内容
  - vue（待补充）
- [ ] excel
  - [x] 翻译词条文件转换为 excel
  - [ ] excel 转换为翻译文件
- [ ] 需替换情况收集
- [ ] 判断是否引入模块，没有则自动引入
- [ ] 替换方法可自定义
- [ ] 引入自动翻译，翻译简单词条（atool-i10n）
- [x] 替换后文件格式化（babel-generator还原的代码格式有很大的问题，由此引入 prettier 对生成的代码进行格式化）