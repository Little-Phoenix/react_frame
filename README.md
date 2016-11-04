# react_frame
gulp + webpack + react框架搭建 取代react-frame


### gulp配置

  gulp中可以配置sass的构建，同时可以将webpack的执行命令放到gulp中进行控制，这样开发的时候，只需要执行gulp命令即可，原来需要开两个git bash,一个执行gulp，一个执行webpack -w

### gulpfile.js:
 ```
  gulp.task('webpack', function(){
  return gulp.src('./src')
             .pipe(webpack(webpackConfig))
             .pipe(gulp.dest('dest'))  //设置webpack构建后的文件的存储位置，设置了此处后，需要将webpack.config.js配置文件中的output的path取消
  })

  gulp.task('sass', function(){ //构建sass
    gulp.src('./src/**/*.sass')
        .pipe(sass().on('error', sass.logError))
        .pipe(minifyCss({zindex: false}))
        .pipe(gulp.dest('dest/'));
    gulp.src('./src/*.sass')
        .pipe(sass().on('error', sass.logError))
        .pipe(minifyCss({zindex: false}))
        .pipe(gulp.dest('dest'))
  })

  //gulp命令默认执行的操作
  gulp.task('default', ['webpack', 'sass'], function(){

  })

  ```
### webpack.config.js:

  ```
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
      chunks: [item + '/' + pageName] //chunks限制html中加载的js文件，列出哪个js，则对哪个js进行加载
    });
    module.exports.entry[item+'/'+pageName] = entryPath + item + '/' + pageName;
    module.exports.plugins.push(HtmlWebpackPluginIns);
  })



  ```
