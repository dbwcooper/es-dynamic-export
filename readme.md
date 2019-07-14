#### 最近在做一个功能， 实现 es6 动态export;
想实现的效果
``` 
// a.js 
const action = {
  name1: () => {},
  name2: () => {},
  name3: () => {}
  ...
}

// 因为 es6 是静态导出，想在代码编译阶段将这种代码片段运行，将export 提取到当前文件的全局作用域。
export { ...action }

// 预期结果像是这种 
export { name1, name2, name3, name4,... }

```   

### 从Babel 开始吧，babel 会将es6 的代码转换为 es5 代码，那么必定会处理 es6 的模块机制。

- 安装   
  ```
  npm install --save-dev @babel/core @babel/cli @babel/preset-env
  ```     
- 在项目的根目录新建 babel.config.js    
  babel 7.x 在执行时会自动在 root 目录下寻找babel.config.js     
  ```
  const presets = [
    ["@babel/env", {
      "corejs": "3.1.4",
      targets: {
        // babel 生成代码支持的浏览器版本
        edge: "17",
        firefox: "60",
        chrome: "67",
        safari: "11.1",
        "ie": "11"
      },
      // 将会在项目内按需引用 corejs, 所以你需要引入 corejs, （默认为 core-js2 版本）
      useBuiltIns: "usage"
    }]
  ];
  const plugins = [];
  module.exports = { presets, plugins };
  ```     

- 手动babel 打包    
  此命令可以将代码 编译到lib文件夹下 （由 @babel/cli 提供）   
  ``` ./node_modules/.bin/babel src --out-dir lib ``` 替换为 npx    
  npx babel 会自动帮你执行 node_modules/.bin 下的 babel 二进制文件。    
  ``` npx babel src --out-dir ```   
  最重要的两个部分      
  1.  <span style="color:red">plugins </span>  
      每一个ES6 的功能都能单独写一个插件，然后在项目内一个个的引用。  
      例如 decorators 插件
        ``` 
        npx babel src --out-dir lib --plugins=@babel/plugin-proposal-decorators    
        ```   
        添加到babel.config.js 
        ```
        const plugins = [
          ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ];
        ```
  2. <span style="color:red">preset </span>   
      preset 为一组plugins 封装，例如 @babel/env, @babel/preset-react @babel/preset-typescript    
      以 @babel 开头的是 babel 官方提供。   
      项目 preset/plugin 一般使用方式是：  
        先使用preset, 如果项目内使用了preset 内没有的插件(例如 decorators)，则使用plugin 的方式添加。
      默认命令        
      ``` npx babel src --out-dir lib --presets=@babel/env```     
      babel.config.js 配置 见babel.config.js


- polyfill   
  利用es5 代码实现 浏览器不支持的标准库的一些属性， 例如 Array.include。           
    在Array的原型链上实现这个includes 方法，在代码中就可以直接使用，并且这也是公用模块，代码打包的最优解。

- babel-loader 专用于 webpack   

### 需要了解的两点  

- requirejs   
  动态加载，意味着没办法进行引入时的优化，使用a.js 中的一个函数必须全部引入 a.js。  
  ```
  //a.js
  const fun1 = () => {}
  const fun2 = () => {}

  module.exports = {
    fun1,
    fun2
  }

  // b.js 

  const a  = require('./a.js');
  ```     
- export, import  
  静态导出模块，导出的内容必须是变量，而不能是值。    
  1. export 只导出变量， export default 123, 导出的是 可被任意重命名的变量 default 值为123
  2. export var a = 123 等价于 var a = 123; export { a }
  3. as 关键字为重命名时使用 
  4. import * as a from 'a.js'; 导出 a.js 中的所有模块
  5. import(); 完成动态导入
  ```
  export var a = 1;
  var a = 1;
  export a; // 不合法
  export { a }; 
  export { a as b, a }

  export { a as default } 
  等价于 
  export default a;

  export default 123; // 导出默认变量 
  ```  


接下来的工作    
1. babel 插件能否实现 export { ...Action };
  export { ...Action } 会报错，无法生成 AST 结构(思路错误)  
  识别 ``` actionFactory() ``` 这个函数 然后暴露函数内的数组。     
  另外今晚的收获 找到了这个, babel开发手册 [babel-handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md)      

  @babel/parser: 将js 代码转义为 ast
  @babel/traverse: 用于遍历 ast 接口中的节点，再也不用像最开始一样写很多forEach 遍历了。
  @babel/types: 写插件时 用来进行断言判断的函数， 处理AST 逻辑帮助比较多, 精简代码 
  @babel/generator: ast to code, 将处理后的 ast 站换为真实的代码。 
  @babel/template : 方便一些简单的变量名替换。



AST 接口
  1. 所有 节点都是继承 `interface Node` 这个接口    
  2. 一个完整的AST树，最外层是 `interface Program`; 
  3. 

2. webpack 插件能否实现 export { ...Action };
