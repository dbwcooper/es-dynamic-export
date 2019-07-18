

const defaultOpts = {
    exportDefaultName: 'actionHelper',
    actionArrayName: 'actions',
    exportActionName: 'actionNames',
}
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

function DynamicExport(babel, options = defaultOpts) {
    const { types: t } = babel;
    const visitor = {
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
    };
    return { visitor };
}
  
module.exports = DynamicExport;
