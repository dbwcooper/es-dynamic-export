// import * as parser from "@babel/parser";
// import traverse from "@babel/traverse";
const parser = require('@babel/parser'); // js 转义 ast 工具。
// require default 默认导出 traverse func
const traverse = require('@babel/traverse').default;
const t = require('@babel/types'); // 一些写插件时 用来进行断言判断的函数
const generate = require('@babel/generator').default; // 一些写插件时 用来进行断言判断的函数
const template = require('@babel/template').default; // 一些写插件时 用来进行断言判断的函数
const code = `
    const arr = ["setState", "getName"];
    const Actions = actionsFactory(arr, 'home');
    export default Actions;
`;
const ast = parser.parse(
    code,
    { sourceType: 'module' } // 支持 export
);
traverse(ast, {
    enter(path) {
        // path.node.type === "Identifier" &&
        // path.node.name === "actionsFactory"
        if (t.isIdentifier(path.node, { name: "actionsFactory" })) {
            path.node.name = "x";
        }
    }
});
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

// const exported = body[body.length - 1];
// console.log('body: ', body);

// const obj = {};
// const actionKeys = [];
// body.forEach(item => {
//     if(item.type === "ExportNamedDeclaration") {
//         exported = item;
//     }
//     debugger;
//     if(item.type === "VariableDeclaration" && !!item.declarations.length) {
//         item.declarations.forEach(itemChild => {
//             if(itemChild.init
//                 && itemChild.init.type === "CallExpression"
//                 && itemChild.init.callee.name === "actionsFactory"
//             ) {
//                 itemChild.init.arguments.forEach(element => {
//                     if(element.type === 'ArrayExpression' && element.elements.length) {
//                         element.elements.forEach(actionKeyItem => {
//                             actionKeys.push(actionKeyItem.value); //get all actions key
//                             console.log('actionKeys: ', actionKeys);
//                         })
//                     }
//                 });
//             }
//         })
//     }
// });
// console.log('actionKeys: ', actionKeys)

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
        // CallExpression(path) {
        //     const param = path.node.params[0];
        //     const paramName = param.callee.name;
        //     param.callee.name = "actionsFactorys"
        //     path.traverse(visitorCallee, { paramName });
        // },
        // ExportNamedDeclaration(path) {
        // }
    };
    const visitorCallee = {
        Identifier(path) {
            if (path.node.name === this.paramName) {
                path.node.name = "actionsFactorys";
            }
        }
    }
    // const traverse = {
    //     enter(path) {
    //         if (t.isIdentifier(path.node, { name: "n" })) {
    //             path.node.name = "x";
    //         }
    //     }
    // }
    
    // path.traverse(MyVisitor)
    return { visitor };
}
  
module.exports = DynamicExport;