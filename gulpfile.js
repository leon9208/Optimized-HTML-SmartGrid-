
var gulp           = require('gulp'),
		browserSync    = require('browser-sync'), // Live reload
		sass           = require('gulp-sass'), // CSS препроцессор
		concat         = require('gulp-concat'), // Объедиенение файлов (стили/скрипты)
		uglify         = require('gulp-uglify'), // минификация JS
		cleanCSS       = require('gulp-clean-css'), // минификация css
		groupmedia		 = require('gulp-group-css-media-queries'), // Объединение медиа-запросов
		rename         = require('gulp-rename'), // переименование файла
		pug            = require('gulp-pug' ), // html препроцессор
		del            = require('del'), // удаление элементов
		imagemin       = require('gulp-imagemin'), // сжатие изображений
		pngquant       = require('imagemin-pngquant'), // сжатие изображений (png)
		cache          = require('gulp-cache'), // чистка кэша
		autoprefixer   = require('gulp-autoprefixer'), // вендорные префикси
		fileinclude    = require('gulp-file-include'), // вставка куска кода в HTML документ
		gulpRemoveHtml = require('gulp-remove-html'), // удаление html кода
		notify         = require("gulp-notify"); //

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false
	});
});

gulp.task('pug', function buildHTML() {
  return gulp.src('app/pug/pages/*.pug')
  .pipe(pug({
    pretty: true
	}))
	.pipe(gulp.dest('app'))
});

gulp.task('sass', ['headersass'], function() {
	return gulp.src('app/sass/**/*.sass')
		.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
		.pipe(rename({suffix: '.min', prefix : ''}))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(groupmedia())
		.pipe(cleanCSS({level: 2}))
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('headersass', function() {
	return gulp.src('app/sass/headers/*.sass')
		.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
		.pipe(rename({suffix: '.min', prefix : ''}))
		.pipe(autoprefixer(['last 15 versions']))
		// .pipe(groupmedia()) // Использовать при отладке, закомментировав cleanCSS
		.pipe(cleanCSS({level: 2})) 
		.pipe(gulp.dest('app'))
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('libs', function() {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js'
		])
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('app/js'));
});

gulp.task('js', function() {
	return gulp.src('app/js/common.js')
		.pipe(rename({suffix: '.min', prefix : ''}))
		.pipe(uglify())
		.pipe(gulp.dest('app/js'));
});

gulp.task('watch', ['sass', 'pug', 'libs', 'browser-sync'], function() {
	gulp.watch('app/header.sass', ['headersass']);
	gulp.watch('app/sass/**/*.sass', ['sass']);
	gulp.watch('app/pug/**/*.pug', ['pug']);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});

gulp.task('imagemin', function() {
	return gulp.src('app/img/**/*')
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/img')); 
});

gulp.task('buildhtml', function() {
  gulp.src(['app/*.html'])
    .pipe(fileinclude({
      prefix: '@@'
    }))
    .pipe(gulpRemoveHtml())
    .pipe(gulp.dest('dist/'));
});

gulp.task('removedist', function() { return del.sync('dist'); });

gulp.task('build', ['removedist', 'buildhtml', 'imagemin', 'sass', 'libs'], function() {

	var buildCss = gulp.src([
		'app/css/fonts.min.css',
		'app/css/main.min.css'
		]).pipe(gulp.dest('dist/css'));

	var buildFiles = gulp.src([
		'app/.htaccess'
	]).pipe(gulp.dest('dist'));

	var buildFonts = gulp.src('app/fonts/**/*').pipe(gulp.dest('dist/fonts'));

	var buildJs = gulp.src([
		'app/js/libs.min.js',
		'app/js/common.js',
		]).pipe(gulp.dest('dist/js'));

});


gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);
