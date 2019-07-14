const parse = require('@babel/parser').parse;
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const generator = require('@babel/generator').default;

const code = `
import { Select as MySelect, Pagination } from 'xxx-ui';
import * as UI from 'xxx-ui';
`

const ast = parse(code, { sourceType: 'module' });

console.log('name: ', ast)
traverse(ast, {
    enter(path){
        console.log('name: ',path )
        if (t.isImportDeclaration(path.node)) {
            const specifiers = path.node.specifiers;
            const source = path.node.source.value;
    
            // 判断当前 import 是何种类型
            const isDefaultImport = t.isImportDefaultSpecifier(specifiers[0]);
            const isNamespaceImport = t.isImportNamespaceSpecifier(specifiers[0]);
    
            if (!isDefaultImport && !isNamespaceImport) {
                const declarations = specifiers.map(specifier => {
                    const importedName = specifier.imported.name;
    
                    return t.ImportDeclaration(
                        [
                            t.ImportDefaultSpecifier(specifier.local)
                        ],
                        t.StringLiteral(`${source}/$5{importedName}/${importedName}.js`)
                    );
                });
    
                path.replaceWithMultiple(declarations);
            }
        }
    }
});
console.log(generator(ast).code);