const parser = require('@babel/parser'); // js代码 to  ast
const traverse = require('@babel/traverse').default;
const t = require('@babel/types'); // 进行断言判断的函数
const generate = require('@babel/generator').default; // ast to js 代码
const template = require('@babel/template').default; // 

const VISITED = Symbol('visited');
const code = `
    const arr = ["setState", "getName"];
    const Actions = actionsFactory(arr, 'home');
    export default Actions;
`;

// const code = `
//     const arr = ["setState", "getName"];
//     export default actionsFactory(arr, 'home');
// `;
function markVisited(node) {
    node[VISITED] = true;
    return node;
}

// 生成 多个 export const setState = Actions.setState;
function buildNamedExport(vaiableName, referenceName) {
    return markVisited(
        t.exportNamedDeclaration(
            null,
            [t.exportSpecifier(t.identifier(vaiableName), t.identifier(referenceName))]
        )
    );
}

const ast = parser.parse(
    code,
    { sourceType: 'module' } // 支持 export/import
);
traverse(ast, {
    ExportDefaultDeclaration(path) {
        const defaultIdentifier = t.identifier('default');
        const declaration = path.node.declaration;
        const isIdentifier = t.isIdentifier(declaration); // export default Actions
        const isCallExpression = t.isCallExpression(declaration);// export default actionsFactory([], name)
        let binding = '';
        if(isIdentifier) {
            binding = path.scope.getBinding(declaration.name);
        } else if (isCallExpression && declaration.callee.name === 'actionsFactory') {
            binding = path.scope.getBinding(declaration.callee.name);
        }
        path.addComment('leading', ' generate by babel plugin ');

        const newNode = t.exportSpecifier(t.identifier('test'), t.identifier('test'));
        path.insertAfter(t.expressionStatement(t.stringLiteral("A little high, little low.")))
        path.insertAfter(newNode)

        const id = declaration.id || path.scope.generateUidIdentifier('default');
        path.insertAfter(buildNamedExport('Actions.setState', 'setState'))

        // path.replaceWithMultiple([
        //     declaration,
        //     buildNamedExport(id, defaultIdentifier)
        //   ]);
        // const isImmutable = !binding || ['const', 'module'].includes(binding.kind);
      }
});

console.log(generate(ast).code);

const ge = generate(ast, {}, code);
console.log('ge: ', ge);
debugger;
const buildRequire = template(`
  var IMPORT_NAME = require(SOURCE);
`);

const ast2 = buildRequire({
  IMPORT_NAME: t.identifier("myModule"),
  SOURCE: t.stringLiteral("my-module")
});

const code2 = generate(ast2).code;
console.log('code2: ', code2);
debugger;

const updateParamNameVisitor = {
    Identifier(path) {
      if (path.node.name === this.paramName) {
        path.node.name = "x";
      }
    }
  };

  
function DynamicExport(babel) {
    console.log('babel: ', babel);
    const { types: t, template, path } = babel;
    const visitor = {
        VariableDeclaration(path) {
            if(path.get('kind').node!='let')return;
                path.node.kind='var';
        },
        FunctionDeclaration(path) {
            const param = path.node.params[0];
            const paramName = param.name;
            param.name = "x";
            path.traverse(updateParamNameVisitor, { paramName });
        },
    };
    const visitorCallee = {
        Identifier(path) {
            if (path.node.name === this.paramName) {
                path.node.name = "actionsFactorys";
            }
        }
    }
    return { visitor };
}
  
module.exports = DynamicExport;