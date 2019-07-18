const parser = require('@babel/parser'); // js代码 to  ast
const traverse = require('@babel/traverse').default;
const t = require('@babel/types'); // 进行断言判断的函数
const generate = require('@babel/generator').default; // ast to js 代码
const template = require('@babel/template').default;

const isSymbol = Symbol('symbol');
function markVisited(node) {
    node[isSymbol] = true;
    return node;
}
const code = `
    import { actionsFactory } from 'tila'
    const actions = ["setState", "getName"];
    const actionHelper = actionsFactory(actions, 'home')
    export default actionHelper;
`;

const defaultOpts = {
    exportDefaultName: 'actionHelper',
    actionArrayName: 'actions',
    exportActionName: 'actionNames',
}

function buildNamedExports(arr, t, options = defaultOpts) {
    // exportSpecifier 必须要两个参数 local,exported;
    // export { local as exported }; local === exported ; export { exported }
    const exportNamedDeclarations = [];
    arr.forEach((key) => {
        const declarator = t.variableDeclarator(
            t.identifier(key),
            t.identifier(`${options.exportDefaultName}.${key}`)
        );
        const declaration = t.variableDeclaration('const', [declarator]);

        const exportNamedDeclaration = t.exportNamedDeclaration(declaration, []);
        exportNamedDeclarations.push(exportNamedDeclaration)
    });
    const declarator = t.variableDeclarator(
      t.identifier('actionNames'), t.identifier(`actionHelper.actionNames`)
    );
    const declaration = t.variableDeclaration('const', [declarator]);
    const exportNamedDeclaration = t.exportNamedDeclaration(declaration, []);
    exportNamedDeclarations.push(exportNamedDeclaration);

    return exportNamedDeclarations
}

const ast = parser.parse(
    code,
    { sourceType: 'module' } // 支持 export/import
);

const actions = [];
const nestVisitor = {
    ArrayExpression: {
        enter(path, arrayActionName) {
            // const getBindingIdentifiers = path.getBindingIdentifiers();
            const bindings = path.scope.bindings;
            if(bindings[arrayActionName]) {
                // 判断是否时同一个数组
                const elements = path.node.elements;
                elements.forEach(item => {
                    actions.push(item.value)
                })
            }
        }
    }
}
traverse(ast, {
    CallExpression: {
        enter(path) {
            if (path.node.callee.name === 'actionsFactory' && path.node.arguments.length && actions.length == 0) {
                const arrayActionNode = path.node.arguments[0];
                const arrayActionName = arrayActionNode.name; // actions change there
                path.findParent((parentPath) => {
                    if(parentPath.type === 'Program') {
                        parentPath.traverse(nestVisitor, arrayActionName);
                    }
                });
                console.log('actions: ', actions);
                const exportedNames = buildNamedExports(actions, t, options = defaultOpts);
                path.findParent((parentPath) => {
                    if(parentPath.parent.type === 'Program') {
                        parentPath.addComment('leading', ' generate by babel plugin ');
                        parentPath.insertAfter(exportedNames);
                        // parentPath.insertAfter(t. stringLiteral('/* generate by babel plugin  */'));
                    }
                });
               
            }
        }
    }
});

const codes = generate(ast).code;
console.log('codes: ', codes)
