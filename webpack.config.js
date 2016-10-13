var webpack = require('webpack')
var path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')
// var node_modules = path.resolve(__dirname, 'node_modules');
// var pathToReact = path.resolve(node_modules, 'react/dist/react.min.js');

var config = require('./config');
var entryPath = './src/'
var pageData = config.pageData;

module.exports = {
  output: {
    path: './dest',
    filename:  'script/[name].js',
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.sass', '.css']
  },
  module: {
    loaders: [ //注意是loaders不是loader，出错会导致css文件构建出现问题
      {test: /\.css$/, loader: 'style!css'},
      {
        test: /\.jsx?$/,
        loader: 'babel',
        query: {//babel-core版本在6.0以上需要如此配置，否则jsx无法解析
          presets: ['react', 'es2015']
        }
      }
    ],
    // noParse: [pathToReact]
  },
  plugins: [
    new webpack.BannerPlugin('This file is created by lcf')

  ]
}

module.exports.entry = {};

Object.keys(pageData).forEach(function(item, index) {

  var splitIndex = item.lastIndexOf('/');
  var pageName = item.substr( ++splitIndex );

  var HtmlWebpackPluginIns = new HtmlWebpackPlugin({
    filename: 'views/' + item + '.html',
    // template: 'src/' + item + '/' + item + '.html',
    // chunks: [item + '/' + pageName, 'vendor'],
    // title: pageData[item],
    // link: (splitIndex < 1 ? '../../' : '../../../') + item + '/' + pageName + '.css',
    // relativePath: (splitIndex < 1? '../' : '../../'),
    // pagePath: (splitIndex < 1 ? './' : '../'),
    // item: pageName,
    // host: config.host
  });
  module.exports.entry[pageName] = entryPath + item + '/' + pageName;
  module.exports.plugins.push(HtmlWebpackPluginIns);
})
