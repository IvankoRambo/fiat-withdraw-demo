var gulp = require('gulp'),
	sass = require('gulp-sass'),
	del = require('del'),
	sourcemaps = require('gulp-sourcemaps'),
	prefix = require('gulp-autoprefixer');

var sassPath = {
	src: 'public/static/scss/**/*.scss',
	dst: 'public/static/css/'
};

gulp.task('css', function(){
	//del(sassPath.dst);
	return gulp.src(sassPath.src)
		.pipe(sourcemaps.init())
		.pipe(sass.sync().on('error', sass.logError))
		.pipe(prefix({cascade: true}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(sassPath.dst));
});

//monitor changes
gulp.task('watch', function(){
	return gulp.watch([sassPath.src], gulp.series('css'));
});