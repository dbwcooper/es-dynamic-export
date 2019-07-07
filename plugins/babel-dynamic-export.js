function DynamicExport(babel) {
    const { types: t, template } = babel;
    const visitor = {
        VariableDeclaration(path) {
            console.log('path: ', path);
        if(path.get('kind').node!='let')return;
            path.node.kind='var';
        },
        ExportNamedDeclaration(path) {

        }
    };
    return {visitor};
}
  
module.exports = DynamicExport;