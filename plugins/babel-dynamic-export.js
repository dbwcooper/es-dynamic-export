const parser = require('@babel/parser'); // js代码 to  ast
const traverse = require('@babel/traverse').default;
const t = require('@babel/types'); // 进行断言判断的函数
const generate = require('@babel/generator').default; // ast to js 代码
const template = require('@babel/template').default; // 

const isSymbol = Symbol('symbol');
const code = `
    import { actionsFactory } from 'tila'
    const actions = ["setState", "getName"];
    const actionHelper = actionsFactory(actions, 'home')
    export default actionHelper;
`;

function markVisited(node) {
    node[isSymbol] = true;
    return node;
}

function buildNamedExports(arr, prefixName, path) {
    const names = [];
    const exportedNames =  arr.map((key) => {
    
    // 生成 actinsNames 对象
    const property = t.objectProperty(t.identifier(key), t.identifier(key));
    names.push(property);

    // exportSpecifier 必须要两个参数 local,exported;
    // if local === exported, the result is export { exported }
    return markVisited(
        t.exportSpecifier(
            t.identifier(`${prefixName}.${key}`),
            t.identifier(key)
        ));
    });
    // const actionsNamesVarUid = path.scope.generateUidIdentifier('actionNames');
    // const action = t.objectExpression(names);
    // { setState: 'setState', getName: 'getName' };
    // const actionsNames = t.variableDeclarator(actionsNamesVarUid, action)
    exportedNames.push(
        t.exportSpecifier(
            t.identifier(`${prefixName}.actionNames`),
            t.identifier('actionNames')
        )
    );
    return t.exportNamedDeclaration(
            null,
            exportedNames
        )
}

const ast = parser.parse(
    code,
    { sourceType: 'module' } // 支持 export/import
);
traverse(ast, {
    FunctionDeclaration(path) {
        const declaration = path.node.declaration;
        console.log("log: FunctionDeclaration -> declaration", declaration)
    },
    
    ExportDefaultDeclaration : {
        enter(path) {
            const declaration = path.node.declaration;
            const nodeName = declaration.name;
            let effectsName = [];
            if(nodeName === 'actionHelper') {
                let container = path.container;
                // 找到 actions 对象
                container.forEach(element => {
                    const declarations = element.declarations;
                    if(element.type === 'VariableDeclaration' && declarations.length) {
                        declarations.forEach(ele => {
                            if(ele.id.name === 'actions') {
                                effectsName = ele.init.elements.map(o => o.value);
                            }
                        });
                    }
                });
            }
            const name = declaration.name;
            path.addComment('leading', ' generate by babel plugin ');
            const exportedNames = buildNamedExports(effectsName, name, path);
            path.insertAfter(exportedNames);
          },
    },
    FunctionDeclaration(path) {
        console.log("log: FunctionDeclaration -> path", path)
    }
});

const codes = generate(ast).code;
console.log('codes: ', codes)

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