var gulp = require('gulp');
var webpack = require('gulp-webpack');
var webpackConfig = require('./webpack.config');
var sass = require('gulp-sass');
var minifyCss = require('gulp-cssnano')

gulp.task('webpack', function(){
  return gulp.src('./src')
             .pipe(webpack(webpackConfig))
             .pipe(gulp.dest('dest'))
})

gulp.task('sass', function(){
  gulp.src('./src/**/*.sass')
      .pipe(sass().on('error', sass.logError))
      .pipe(minifyCss({zindex: false}))
      .pipe(gulp.dest('dest/'))
})

gulp.task('default', ['webpack', 'sass'], function(){

})
