const presets = [
    ["@babel/env", {
      "corejs": "3.1.4",
      targets: {
        // "browsers": ["last 1 Chrome versions"]
        // "esmodules": true,
        edge: "17",
        firefox: "60",
        chrome: "67",
        safari: "11.1",
        ie: "11"
      },
      useBuiltIns: "usage"
    }]
  ];

const plugins = [
  [
    "@babel/plugin-proposal-decorators", { "legacy": true },
    "./plugins/babel-dynamic-export.js"
  ],
];

if (process.env["ENV"] === "prod") {
  console.log('process.env: ', process.env);
  // plugins.push(...);
}

module.exports = { presets, plugins };
