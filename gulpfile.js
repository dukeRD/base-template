var gulp        = require('gulp');
var sass        = require('gulp-sass');
var sourcemaps  = require('gulp-sourcemaps');
var concat      = require('gulp-concat');
var babel       = require('gulp-babel');
var rename      = require('gulp-rename');
var rimraf      = require('rimraf');
var panini      = require('panini');
var gulpIf      = require('gulp-if');
var imagemin    = require('gulp-imagemin');
var rollup      = require('rollup-stream');
var source      = require('vinyl-source-stream');
var buffer      = require('vinyl-buffer');

var browserSync = require('browser-sync').create();

var path = {
	src:{
		sass:  './src/sass/',
		html:  './src/html/',
		js:    './src/js/',
		img:   './src/img/',
		fonts: './src/fonts/'
	},
	dist:{
		html:  './dist',
		css:   './dist/css',
		js:    './dist/js',
		img:   './dist/img',
		fonts: './dist/fonts'
	}
}


gulp.task('sass', function(){
	return gulp.src(path.src.sass + '*.scss')
		.pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(rename("app.css"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.dist.css))
    .pipe(browserSync.stream());
});

gulp.task('js', function(){
	return rollup({
      input: './src/js/app.js',
      sourcemap: true,
      format: 'iife'
    })
    .pipe(source('app.js', './src/js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    // transform the code further here.
  	.pipe(babel({
              presets: ['env']
          }))
    //.pipe(rename('index.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.dist.js));
})

gulp.task('html', function(){
	return gulp.src( path.src.html + 'pages/*.html' )
		.pipe(panini({
		  root:     path.src.html + 'pages/',
		  layouts:  path.src.html + 'templates/',
		  partials: path.src.html + 'chunks/',
		  data:     path.src.html + 'data/',
		  helpers:  path.src.html + 'helpers/'
		}))
		.pipe(gulp.dest(path.dist.html));
});

gulp.task('img', function(){
	  return
	  gulp.src(path.src.img + '/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest(path.dist.img))
});

gulp.task('fonts', function(){
	  return gulp.src(path.src.fonts)
	    .pipe(gulp.dest(path.dist.fonts));
});


gulp.task('panini.refresh', function(){
  return panini.refresh();
});

gulp.task('browserSync.reload', function(){
	browserSync.reload();
});

gulp.task('server', ['sass','js','html','img','fonts'], function() {

    browserSync.init({
	    server: path.dist.html, port: '8080',
	    index: "home.html"
      // proxy: "site.local"
    });

    gulp.watch( path.src.sass + "**/*.scss",                 ['sass']                                        );
    // TODO: move to path variable
    // fix add/del js files
    gulp.watch( "src/js/**/*.js", {cwd: './'},               ['js','browserSync.reload']                     );
    // gulp.watch( path.src.js   + "**/*.js",                ['js','browserSync.reload']                     );
    gulp.watch( path.src.html + "**/*",                      ['html','panini.refresh','browserSync.reload']  );
    gulp.watch( path.src.html + "data/**/*.{json,yml}",      ['html','panini.refresh','browserSync.reload']  );
});


gulp.task('clean', function (cb) {
  return rimraf('./dist', cb);
});


// Default gulp task to run
gulp.task('default', ['clean'], function(){
	gulp.start('server');
});

