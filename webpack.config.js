var webpack = require('webpack')
var path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require("extract-text-webpack-plugin")

var config = require('./config');
var entryPath = './src/'
var pageData = config.pageData;

var ExtractTextPluginInstance = new ExtractTextPlugin('style.css', {
  allChunks: true
})

module.exports = {
  watch: true, //监听js、jsx文件的修改，类似执行webpack -w
  output: {
    // path: './dest',
    filename:  '[name].js',
    publicPath: '/',
    chunkFileName: '[name].js'
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
      },
      {test: /\.sass/, loader: 'style!css!sass?sourceMap'}
    ],
    // noParse: [pathToReact]
  },
  plugins: [
    new webpack.BannerPlugin('This file is created by lcf'),
    ExtractTextPluginInstance
  ]
}

module.exports.entry = {};

Object.keys(pageData).forEach(function(item, index) {

  var splitIndex = item.lastIndexOf('/');
  var pageName = item.substr( ++splitIndex );

  var HtmlWebpackPluginIns = new HtmlWebpackPlugin({
    files: {
      css : '../' + item + '/' + pageName + '.css',
      js: '../' + item + '/' + pageName + '.js',
      chunks: {
        head: {
          css: ['style.css']
        }
      }
    },
    template: 'src/' + item + '/' + pageName + '.html',
    filename: 'views/' + item + '.html',
    title: pageData[item],
    inject: true,
    chunks: [item + '/' + pageName] //chunks限制html中加载的js文件，列出哪个js，则对哪个js进行加载
  });
  module.exports.entry[item+'/'+pageName] = entryPath + item + '/' + pageName;
  module.exports.plugins.push(HtmlWebpackPluginIns);
})
