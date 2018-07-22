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

var scripts = [
	// path.src.js + 'jquery-3.3.1.min.js',//CDN
 //  path.src.js + 'modernizr-custom.js',
	// path.src.js + 'slick.min.js',
	// path.src.js + 'wow.min.js',
	path.src.js + 'main.js'
];

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
	return gulp.src(scripts)
	.pipe(concat('app.js'))
	.pipe(sourcemaps.init())
	.pipe(babel({
            presets: ['env']
        }))
  .pipe(sourcemaps.write())
	.pipe(gulp.dest(path.dist.js));
});

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
      // proxy: "hoo4.local"
    });

    gulp.watch( path.src.sass + "**/*.scss",                 ['sass']                                        );
    gulp.watch( path.src.js   + "**/*.js",                   ['js','browserSync.reload']                     );
    gulp.watch( path.src.html + "**/*",                      ['html','panini.refresh','browserSync.reload']  );
    gulp.watch( path.src.html + "data/**/*.{json,yml}",      ['html','panini.refresh','browserSync.reload']  );
    // gulp.watch('src/data/**/*.{json,yml}').on('all', gulp.series(resetPages, pages, browser.reload));
});


gulp.task('clean', function (cb) {
  return rimraf('./dist', cb);
});


// Default gulp task to run
gulp.task('default', ['clean'], function(){
	gulp.start('server');
});

