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
  watch: true,
  output: {
    // path: './dest',
    filename:  '[name].js',
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
      "css" : '../' + item + '/' + pageName + '.css',
      'js': '../' + item + '/' + pageName + '.js'
    },
    template: 'src/' + item + '/' + pageName + '.html',
    filename: 'views/' + item + '.html',
    title: pageData[item],
    inject: true,
	  xhtml: true
  });
  module.exports.entry[item+'/'+pageName] = entryPath + item + '/' + pageName;
  // module.exports.plugins.push(new ExtractTextPlugin( '../' + item + '/' + pageName + '.css') )
  module.exports.plugins.push(HtmlWebpackPluginIns);
})
