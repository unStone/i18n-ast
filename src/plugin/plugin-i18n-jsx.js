const t = require('@babel/types');

const replaceLineBreak = function (value) {
  if(typeof value !== 'string') return value
  return value.replace(/\n/g, ' ')
}

const baseType = function(v) {
  return Object.prototype.toString.call(v)
}

const judgeChinese = function(text) {
  return /[\u4e00-\u9fa5]/.test(text);
}

function reactPlugin (allTranslateWord, randomStr, arg) {
  function makeReplace({value, variableObj}) {
    arg.translateWordsNum++;
    let key = randomStr();
    const val = value;
    if(allTranslateWord[val]) {
      key = allTranslateWord[val];
    } else {
      allTranslateWord[val] = key
    }
    
    // 用于防止中文转码为 unicode
    const v = Object.assign(t.StringLiteral(value), {
      extra: {
        raw: `\'${value}\'`,
        rawValue: value,
      }
    })
    return t.CallExpression(
      t.MemberExpression(
        t.CallExpression(
          t.MemberExpression(
            t.Identifier("intl"),
            t.Identifier("get")
          ),
          setObjectExpression(variableObj) ? [t.StringLiteral(key), setObjectExpression(variableObj)] : [t.StringLiteral(key)]
        ),
        t.Identifier("d"),
      ),
      [v]
    );
  }

  function setObjectExpression(obj) {
    if(baseType(obj) === '[object Object]') {
      const ObjectPropertyArr = [];
      for(const o in obj) {
        ObjectPropertyArr.push(
          t.ObjectProperty(t.Identifier(o), t.Identifier(obj[o]))
        )
      }
      return t.ObjectExpression(ObjectPropertyArr)
    }
    return null;
  }

  const plugin = function ({ types: t }) {
    return {
      visitor: {
        ImportDeclaration(path) {
          const { node } = path;
          if (node.source.value === 'react-intl-universal') {
            arg.hasImportModule = true;
          }
          path.skip();
        },
        JSXText(path) {
          const { node } = path;
          if (judgeChinese(node.value)) {
            path.replaceWith(
              t.JSXExpressionContainer(makeReplace({
                value: node.value.trim().replace(/\n\s+/g, "\n")
              }))
            );
          }
          path.skip();
        },
        CallExpression(path) {
          // 跳过 intl.get() 格式
          if (path.node.callee.type === "MemberExpression") {
            if(path.node.callee.property.name === "d") {
              path.skip()
              return;
            }
          }
        },
        StringLiteral(path) {
          const { node } = path;
          const { value } = node;
          if (judgeChinese(value)) {
            if (path.parent.type === 'JSXAttribute') {
              path.replaceWith(t.JSXExpressionContainer(makeReplace({
                value: value.trim()
              })));
            } else if(path.parent.type === 'ObjectProperty') {
              path.replaceWith(makeReplace({
                value: value.trim()
              }));
            } else if(path.parent.type === 'AssignmentExpression') {
              path.replaceWith(makeReplace({
                value: value.trim()
              }));
            } else {
              path.replaceWith(makeReplace({
                value: value.trim()
              }));
            }
            path.skip();
          }
        },
        TemplateLiteral(path) {
          if(!path.node.quasis.every(word => !judgeChinese(word))) {
            path.skip();
            return
          }
          const tempArr = [].concat(path.node.quasis, path.node.expressions).sort(function(a,b){
            return a.start - b.start;
          })
          let isreplace = false;
          let v = '';
          const variable = {}
          tempArr.forEach(function(t) {
            if(t.type === 'TemplateElement') {
              v += `${replaceLineBreak(t.value.cooked)}`;
              if(judgeChinese(t.value.cooked)) {
                isreplace = true;
              }
            } else if(t.type === 'Identifier') {
              variable[t.name] = t.name;
              v += `{${t.name}}`
            } else if(t.type === 'CallExpression') {
              // TODO
              isreplace = false;
            } else {
              // ...TODO
              isreplace = false;
            }
          })
          if(!isreplace) {
            path.skip();
            return
          }
          if(v.trim() === '') {
            path.skip();
            return
          }
          path.replaceWith(makeReplace({
            value: v,
            variableObj: variable,
          }));
          path.skip();
        },
      }
    };
  }

  return plugin
}

module.exports = reactPlugin