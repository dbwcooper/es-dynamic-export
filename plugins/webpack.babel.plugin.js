const parser = require('@babel/parser'); // js代码 to  ast
const traverse = require('@babel/traverse').default;
const t = require('@babel/types'); // 进行断言判断的函数
const generate = require('@babel/generator').default; // ast to js 代码


const exportNamesMap = {
  "setState": "ActionHelper.setState"
}
function generatEND(local, exported) {
  const declarator = t.variableDeclarator(
      t.identifier(local),
      t.identifier(exported)
  );
  const declaration = t.variableDeclaration('const', [declarator]);
  const exportNamedDeclaration = t.exportNamedDeclaration(declaration, []);
  return exportNamedDeclaration;
}

function buildNamedExports(actionHelperName = 'actionHelper') {
  // exportSpecifier 必须要两个参数 local,exported;
  // export { local as exported }; local === exported ; export { exported }
  const exportNamedDeclarations = [generatEND('actionNames', `${actionHelperName}.actionNames`)];
  for (let key in exportNamesMap) {
      exportNamedDeclarations.push(
          generatEND(key, exportNamesMap[key])
      );
  }
  return exportNamedDeclarations
}

const visitor = {
  ArrayExpression: {
      enter(path, { arrayActionName, actionHelperName }) {
          // 找到 js 文件顶层作用域上使用到的数组。
          if(path.scope.bindings[arrayActionName]) {
              path.node.elements.forEach(item => {
                  exportNamesMap[item.value] = `${actionHelperName}.${item.value}`;
              })
          }
      }
  },
  ExportNamedDeclaration: {
      enter(path) {
          let name = null;
          if(path.node.specifiers && path.node.specifiers.length) {
              const node = path.node.specifiers[0];
              name = node.exported.name
          } else if(path.node.declaration && path.node.declaration.declarations.length) {
              const node = path.node.declaration.declarations[0];
              name = node.id.name
          }
          // 如果全局作用域内已有此变量定义，则不再导出。
          if (name && exportNamesMap[name]) {
              delete exportNamesMap[name];
          }
      }
  }
}

function getJSCode(code) {
  const ast = parser.parse(
    code,
    { sourceType: 'module' } // 支持 export/import
  );
  let resultCode = '';
  traverse(ast, {
    CallExpression: {
      enter(path) {
          if (path.node.callee.name === 'actionsFactory' && path.node.arguments.length) {
              const arrayActionName = path.node.arguments[0].name;
              const identifierName = path.container.id.name;
              path.findParent((parentPath) => {
                  if(parentPath.type === 'Program') {
                      parentPath.traverse(visitor, { arrayActionName, actionHelperName: identifierName });
                      const exporteds = buildNamedExports(identifierName);
                      const addAfterNodes = t.program(exporteds, [], 'module')
                      resultCode = generate(addAfterNodes).code;
                      parentPath.stop(); // 此ast 树不再遍历。
                  }
              });
          }
      }
    }
  });
  return code + '\r\n' + resultCode;
}
module.exports = getJSCode;
