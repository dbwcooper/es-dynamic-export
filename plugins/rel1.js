/* eslint-disable guard-for-in */
const parser = require('@babel/parser'); // js代码 to  ast
const traverse = require('@babel/traverse').default;
const t = require('@babel/types'); // 进行断言判断的函数
const generate = require('@babel/generator').default; // ast to js 代码
const recast = require("recast"); // magic output source with formatter, es6 to es6; https://github.com/benjamn/recast

// 'setState': 'ActionHelper.setState'
const exportNamesMap = {};

function generateName(local, exported) {
  const declarator = t.variableDeclarator(
    t.identifier(local),
    t.identifier(exported)
  );
  const declaration = t.variableDeclaration('const', [declarator]);
  const exportNamedDeclaration = t.exportNamedDeclaration(declaration, []);
  return exportNamedDeclaration;
}

function buildNamedExports() {
  // exportSpecifier 必须要两个参数 local,exported;
  // export { local as exported }; local === exported ; export { exported }
  const exportNamedDeclarations = [];
  for (let key in exportNamesMap) {
    exportNamedDeclarations.push(
      generateName(key, exportNamesMap[key])
    );
  }
  return exportNamedDeclarations
}

const visitor = {
  ArrayExpression: {
    enter(path, { arrayActionName, actionHelperName }) {
      // 找到 actionFactory 中使用的数组。
      if (path.scope.bindings[arrayActionName]) {
        path.node.elements.forEach((item) => {
          exportNamesMap[item.value] = `${actionHelperName}.${item.value}`;
        })
      } else if (path.node && path.node.elements.length) {
        path.node.elements.forEach((item) => {
          exportNamesMap[item.value] = `${actionHelperName}.${item.value}`;
        })
      }
    }
  },
}

let ExportNamedStr = '';
let ExportDefaultBeforeStr = ''
function getCodeFromAst(code) {
  const recastOptions = {
    parser: {
      parse(source) {
        return parser.parse(source, {
          sourceType: "module" // es module 
        });
      }
    }
  };
  const ast = recast.parse(code, recastOptions);
  traverse(ast, {
    CallExpression: {
      enter(path) {
        if (path.node.callee.name === 'actionsFactory' && path.node.arguments.length) {
          const arrayActionName = path.node.arguments[0].name;
          const identifierName = path.container.id.name;
          path.findParent((parentPath) => {
            if (parentPath.type === 'Program') {
              exportNamesMap['actionNames'] = `${identifierName}.actionNames`;
              parentPath.traverse(visitor, { arrayActionName, actionHelperName: identifierName });
              if (Object.keys(exportNamesMap).length) {
                const exporteds = buildNamedExports(identifierName);
                const addAfterNodes = t.program(exporteds, [], 'module')
                ExportNamedStr = generate(addAfterNodes).code; // ast to jscode
              }
              parentPath.stop(); // 此ast 树不再遍历。
            }
          });
        }
      }
    },
    ExportNamedDeclaration: {
      enter(path) {
        path.remove()
      }
    }
  });
  // delete all export , except export default 
  traverse(ast, {
    ExportNamedDeclaration: {
      enter(path) {
        path.remove()
      }
    }
  });
  ExportDefaultBeforeStr = recast.print(ast).code;
  return ExportDefaultBeforeStr + '\r\n' + ExportNamedStr;
}
module.exports = getCodeFromAst;
