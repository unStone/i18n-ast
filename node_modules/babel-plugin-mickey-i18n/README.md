# babel-plugin-mickey-i18n-scanner

> Extract i18n message files and replace text with i18n-formatter.

[React Intl](https://github.com/yahoo/react-intl) is awesome. But, [defineMessages](https://github.com/yahoo/react-intl/wiki/API#definemessages) is hard-coding, also Global ID management is difficult and confusing.

This plugin releases you from tedious codings, helps you building react components without any perceptions of i18n.

Take a look at the following component:

```jsx
import React from 'react';

export default class HelloI18n extends React.Component {
  constructor(props) {
    super(props);
    this.hello = '你好';
    this.template = `你好，${this.state.name}`
  }

  state = {
    hello: '你好',
    name: '小明',
  }

  render() {
    const { hello, name } = this.state;
    return (
      <div title="小明，你好">
        <p>{name}，{hello}</p>
        <p>小明，你好</p>
      </div>
    );
  }
}
```

Compiled with this plugin, result that all the Chinese characters in this component ware replaced with `_i18n` mathod which exported from [mickey-i18n](https://github.com/mickeyjsx/mickey-i18n)(the client for localized messages):

```jsx
import { i18n as _i18n } from "mickey-i18n";
import React from 'react';

export default class HelloI18n extends React.Component {
  constructor(props) {
    super(props);
    this.hello = _i18n("652829", "你好");
    this.template = _i18n("-743864039", "你好，{0}", [this.state.name])
  }

  state = {
    hello: _i18n("652829", "你好"),
    name: _i18n("756703", "小明"),
  }

  render() {
    const { hello, name } = this.state;
    return (
      <div title={_i18n("1131501034", "小明，你好")}>
        <p>{name}，{hello}</p>
        <p>{_i18n("1131501034", "小明，你好", [], true)}</p>
      </div>
    );
  }
}
```

We also get a message file like this, the id is the text's hashcode:

```json
[
  {
    "id": 652829,
    "text": "你好",
  },
  {
    "id": -743864039,
    "text": "你好，{0}",
  },
  {
    "id": 756703,
    "text": "小明",
  },
  {
    "id": 1131501034,
    "text": "小明，你好",
  },
]
```

Then we can use [atool-l10n](https://github.com/ant-tool/atool-l10n) to automatically generate localization resource.

## Install

```bash
npm install babel-plugin-mickey-i18n-scanner --save-dev
npm install mickey-i18n react react-dom react-intl --save
```

## Usage

Add the following section in your .babelrc:

```json
{
  "plugins": ["mickey-i18n", { "dest": "./i18n_messages" }]
}
```

## Options

- `dest` The target directory of message file. Default: `./i18n_messages`
- `filename` The target file name of message file. Default: `i18n.json`
- `debug` If `true` we will get message files of each component. Default: `false`

## Contributing

Pull requests and stars are highly welcome.

For bugs and feature requests, please [create an issue](https://github.com/mickeyjsx/babel-plugin-mickey-i18n-scanner/issues/new).
