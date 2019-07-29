const webpack = require('webpack')
const path = require('path');
const webpackPlugin = require('./plugins/webpack.plugin')

module.exports = {
  entry: './lib/example/a.js',
  mode: "development",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.js$/, use: 'babel-loader' }
    ]
  },
  plugins: [
    // new webpackPlugin({options: true})
  ]
};