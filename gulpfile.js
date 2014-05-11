//Dependencies
var gulp 			= require('gulp');
var $ 				= require('gulp-load-plugins')();

//Some Vars to help us get the job done.
var sassDir 		= 'public/assets/styles/sass';
var	targetCSS		= 'public/assets/styles/css';
var watching 		= false;

//onError function handles well known issue with gulp.watch throwing errors. It can be read about @ https://gist.github.com/mattkersley/9939822
function onError(err) {
  console.log(err.toString());
  if (watching) {
    this.emit('end');
  } else {
    process.exit(1);
  }
}


//Watches everything in the public folder and emits it to the reloader task.
gulp.task('watchLoader', function(){
	watching = true;
	gulp.watch('./public/**/*.{css,html,js,php}', ['reloader']);
	
})

//Watches source files and pipes output to livereload
gulp.task('reloader', function(){
	gulp.src('.')
		.pipe($.livereload())
})

//jshint spits out error reports on your shoddy JS craftsmanship.
gulp.task('hint', function(){
	gulp.src('./public/js/**/*.js')
		.pipe($.jshint())
		.pipe($.jshint.reporter('default'))
		.pipe($.notify({ message: 'JS hints have been provided' }));
})

//whipe out the destination file to avoid continously concat onto the end of the file
gulp.task('cleaner', function(){
	return gulp.src('./public/js/all.js', {read: false})
		.pipe($.plumber())
		.pipe($.clean())
		.pipe($.plumber())
		.pipe($.notify({ message: 'Destination file cleaned' }));
})

//Concat all JS into one file. 
gulp.task('scripts', function(){
	gulp.src('./public/js/**/*.js')
		.pipe($.watch())
		.pipe($.continuousConcat('all.js'))
		.pipe(gulp.dest('./public/js/'))
		.pipe($.notify({ message: 'JS has been concactinated' }));
});

//minify all your JS 
gulp.task('minJS', function(){
	return gulp.src('./public/js/**/*.js')
		.pipe($.jshint())
		.pipe($.jshint.reporter('default'))
		.pipe($.concat('all.js'))
		.pipe($.ngmin())
		.pipe(gulp.dest('./public/js/'))
		.pipe($.uglify({mangle: false}))
		.pipe(gulp.dest('./public/js/'))
		.pipe($.notify({ message: 'JS has been minified ' }));
});

//Proccesses sass into CSS, minifies it, autoprefixes it, and ejects it into the destination folder.
gulp.task('sass', function(){
	return gulp.src(sassDir + '/yourApp.scss')
		.pipe($.rubySass({style: 'compressed'}).on('error', onError))
		.pipe($.autoprefixer('last 10 version', 'ie 8', 'ie 9', 'ios 6', 'android 4', 'Firefox > 20' ))
		.pipe(gulp.dest(targetCSS))
		.pipe($.notify({ message: 'Sass Compression Complete' }));
});

//watches sass file and emits any changes to the sass task.
gulp.task('watch', function(){
	watching = true;
	gulp.watch('public/assets/styles/sass/*.scss', ['sass']);
})


gulp.task('development', ['sass', 'hint', 'scripts', 'watch', 'reloader', 'watchLoader']);

gulp.task('default', ['cleaner'], function(){
	gulp.start('development')
});

//cleans dest file and then calls minJS
gulp.task('production', ['cleaner'], function(){
	gulp.start('minJS');
});