var fs = require('fs');
const path = require("path");
const chokidar = require("chokidar");
const getJSCode = require('./webpack.babel.plugin.js');
class webpackPlugin {
  constructor(options = { contentx}) {
    this.options = options;
  }
  apply(compiler) {
    let context = '';
    let needWatch = false;
    if (typeof process.env.NODE_ENV === 'undefined') {
      needWatch = compiler.options.mode === 'development';
    }
    compiler.hooks.afterCompile.tap("copyPluginAfterCompile", function (compilation) {
      if(needWatch) {
        const actionPath = path.resolve(context, './src/action/');
        const watchActions = chokidar.watch(actionPath);
        // const log = console.log.bind(console);
        watchActions.on('change', (path) => {
          fs.readFile(path, 'utf8', (err, actionContent) => {
            if (err) throw err;
            const data = getJSCode(actionContent);
            try {
              const fd = fs.openSync(path, 'w');
              fs.writeFileSync(fd, data, 'utf8');
              console.log('append!');
            } catch (err) {
              console.log('fs.readFile err: ', err);
            }
          });
        })
        needWatch = false;
      }
    });
  }
}


module.exports = webpackPlugin;
