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
  i18n-ast -e [path] -o [path]
```

2. 在根目录下新建配置文件 i18n-ast.config.js
```js
module.exports = () => ({
  entry: "需要转换的文件路径",
  output: "输出的文件路径",
  exclude: []//排除的文件（类型是数组）
})
```