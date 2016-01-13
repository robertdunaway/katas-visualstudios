﻿/// <binding ProjectOpened='default, tsd' />
var onError = function (err) {
    console.log(err);
};

var gulp = require('gulp')
    , rename = require('gulp-rename')
    , sourcemaps = require('gulp-sourcemaps')
    , runSequence = require('run-sequence')
    , plumber = require('gulp-plumber')
    , clean = require('gulp-clean')
    , newer = require('gulp-newer')
    , minifyhtml = require('gulp-minify-html')
    , ts = require('gulp-typescript')
    , tslint = require('gulp-tslint')
    , tsstylish = require('gulp-tslint-stylish')
    , watch = require('gulp-watch')
    , uglify = require('gulp-uglify')
    , tsd = require('gulp-tsd')
;

gulp.task('clean-wwwroot', function () {
    return gulp.src('wwwroot', { read: false })
      .pipe(plumber({
          errorHandler: onError
      }))
      .pipe(clean());
});

gulp.task('copy-to-wwwroot', function () {
    return gulp.src('src/**/*')
      .pipe(plumber({
          errorHandler: onError
      }))
    .pipe(newer('wwwroot'))
    .pipe(gulp.dest('wwwroot'));
});

gulp.task('minifyhtml', function () {
    return gulp.src(['wwwroot/**/*.html', '!/**/*.min.html', '!wwwroot/core/lib/**/*'])
      .pipe(plumber({
          errorHandler: onError
      }))
     .pipe(sourcemaps.init())
     .pipe(minifyhtml())
     .pipe(rename({
         extname: '.min.html'
     }))
     .pipe(sourcemaps.write('./'))
     .pipe(gulp.dest('wwwroot/./'));
});

gulp.task('tscompile', function () {
    return gulp.src(['./wwwroot/**/*.ts', '!wwwroot/core/lib/**/*.*', '!wwwroot/core/css/**/*.*'])
      .pipe(plumber({
          errorHandler: onError
      }))
    .pipe(sourcemaps.init())
    .pipe(ts({
        target: 'ES5',
        declarationFiles: false,
        noExternalResolve: true
    }))
    .pipe(rename({ extname: '.js' }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('wwwroot/./'));
});


gulp.task('tslint', function () {
    return gulp.src(['./wwwroot/**/*.ts', '!wwwroot/core/lib/**/*.*', '!wwwroot/core/css/**/*.*'])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(tslint())
        .pipe(tslint.report('verbose', {
            emitError: false,
            sort: true,
            bell: true
        }));
});

gulp.task('tsd', function () {
    return gulp.src('./gulp_tsd.json').pipe(tsd());
});

gulp.task('libs', function () {
    return gulp.src(['bower_components/**//bootstrap/dist/js/bootstrap.min.js'
                    , 'bower_components/**//normalize-css/normalize.css'
                    , 'bower_components/**//font-awesome/css/font-awesome.min.css'
                    , 'bower_components/**/font-awesome/fonts/*.*'
                    , 'bower_components/**//jquery/dist/jquery.min.js'
                    , 'bower_components/**//angular/*.min.js'
                    , 'bower_components/**//angular-ui-router/release/angular-ui-router.min.js'
                    , 'bower_components/**//angular-bootstrap/ui-bootstrap-tpls.min.js'
                    , 'bower_components/**//lodash/lodash.min.js'])
      .pipe(plumber({
          errorHandler: onError
      }))
      //.pipe(concat('libs.js'))
      .pipe(gulp.dest('wwwroot/lib/bower/./'));
});





 
// ----------------------------------------------------------------
// Default Task
// ----------------------------------------------------------------
gulp.task('default', function () {
    runSequence('clean-wwwroot', 'copy-to-wwwroot',
                ['minifyhtml', 'tscompile', 'tslint']
                , 'watch'
                );
});


gulp.task('watch', function () {

    // ---------------------------------------------------------------
    // Watching JS files
    // ---------------------------------------------------------------
    // Copy all files except *.js files.
    gulp.watch(['src/**/*', '!bower_components/**.*'], function () { runSequence('copy-to-wwwroot'); });

    // ---------------------------------------------------------------
    // Watching TypeScript files
    // ---------------------------------------------------------------
    gulp.watch(['wwwroot/**/*.ts', '!wwwroot/core/lib/**/*.*', '!wwwroot/core/css/**/*.*'], function () { runSequence('tscompile'); });

    // ---------------------------------------------------------------
    // Watch - Execute linters
    // ---------------------------------------------------------------
    gulp.watch(['wwwroot/**/*.ts', '!wwwroot/core/lib/**/*.*', '!wwwroot/core/css/**/*.*'], function () { runSequence('tslint'); });

    gulp.watch(['wwwroot/**/*.html', '!wwwroot/**/*.min.html', '!wwwroot/core/lib/**/*'], ['minifyhtml']);

});