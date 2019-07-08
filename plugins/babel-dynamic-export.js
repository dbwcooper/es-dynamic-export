const { parse } = require('@babel/parser');

const code = `
    const Actions = actionsFactory(["setState", "getName"], 'home');
    const arr = [];
    export { Actions, arr };
`;
const { program: { body } } = parse(code, { sourceType: 'module' }); // 支持 export
const exported = body[body.length - 1];
console.log('body: ', body);

const obj = {};
const actionKeys = [];
body.forEach(item => {
    if(item.type === "ExportNamedDeclaration") {
        exported = item;
    }
    if(item.type === "VariableDeclaration" && !!item.declarations.length) {
        item.declarations.forEach(itemChild => {
            if(itemChild.init
                && itemChild.init.type === "CallExpression"
                && itemChild.init.callee.name === "actionsFactory"
            ) {
                itemChild.init.arguments.forEach(element => {
                    if(element.type === 'ArrayExpression' && element.elements.length) {
                        element.elements.forEach(actionKeyItem => {
                            actionKeys.push(actionKeyItem.value); //get all actions key
                            console.log('actionKeys: ', actionKeys);
                        })
                    }
                });
            }
        })
    }
});
console.log('actionKeys: ', actionKeys)

function DynamicExport(babel) {
    console.log('babel: ', babel);
    const { types: t, template } = babel;
    const visitor = {
        VariableDeclaration(path) {
        if(path.get('kind').node!='let')return;
            path.node.kind='var';
        },
        ExportNamedDeclaration(path) {
        }
    };
    const traverse = {
        enter(path) {
            if (t.isIdentifier(path.node, { name: "n" })) {
                path.node.name = "x";
            }
        }
    }
    return { visitor, traverse };
}
  
module.exports = DynamicExport;