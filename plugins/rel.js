let fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const getCodeFromAst = require('./parse-ast');

class webpackPlugin {
  constructor(options = { listenPath: '' }) {
    this.options = options;
  }
  apply(compiler) {
    this.listenPath = path.resolve(compiler.context, this.options.listenPath);
    const listeningPath = this.listenPath;
    let needWatch = compiler.options.mode === 'development';
    if (needWatch) {
      const log = console.log.bind(console);
      chokidar.watch(listeningPath)
      .on('add', addpath => log('add: ', addpath))
      .on('change', (listeningFilePath) => {
        try {
          fs.readFile(listeningFilePath, { encoding: 'utf8' }, (readError, readFileData) => {
            if (readError) throw readError;
            if (this.originCode !== readFileData) {
              let resultCode = getCodeFromAst(readFileData);
              this.originCode = resultCode;
              setTimeout(() => {
                fs.writeFileSync(listeningFilePath, this.originCode);
              }, 2000);
            }
          })
         
        } catch (error) {
          if (error) throw error;
        }
      })
      needWatch = false;
    }
  }
}


module.exports = webpackPlugin;
