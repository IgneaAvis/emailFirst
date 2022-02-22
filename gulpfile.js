const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const less = require('gulp-less');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const inlineCss = require('gulp-inline-css');
const smoosher = require('gulp-smoosher');
const htmlmin = require('gulp-htmlmin');
const image = require('gulp-image');
const del = require('del');
const path = require('path');


/*----------------------------------------*/
/* tasks for development on source folder */
/*----------------------------------------*/

/* server and watcher for dev */

gulp.task('serverDev', function(done) {
  browserSync.init({
    server: {
       baseDir: 'source'
    },
  });
  done();
  gulp.watch('source/less/**/*.less', gulp.series('cssCompil'));
  gulp.watch('source/*.html').on('change', browserSync.reload);
});

/* style css compile, autoprefixer, source map */

gulp.task('cssCompil', function() {
  return gulp.src('source/less/style.less')
    .pipe(sourcemaps.init())
    .pipe(less({
      paths: [path.join('source/less', 'less', 'includes')],
      relativeUrls: true
    }))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('source/css'))
    .pipe(browserSync.stream());
});

/*----------------------------------------*/
/* tasks for production on build folder   */
/*----------------------------------------*/

gulp.task('inlineStyle', function() {
  return gulp.src('source/*.html')
    .pipe(smoosher())
    .pipe(inlineCss({
              preserveMediaQueries: true
            }))
    .pipe(gulp.dest('build'));
});

/* html minify */

gulp.task('htmlMin', function() {
  return gulp.src('build/*.html')
    .pipe(htmlmin({
    collapseWhitespace: true,
    removeComments: true,
    }))
    .pipe(gulp.dest('build'));
});

/* image minify */

gulp.task('imageMin', function() {
  return gulp.src('build/image/*')
    .pipe(image({
      optipng: ['-i 1', '-strip all', '-fix', '-o7', '-force'],
      pngquant: ['--speed=1', '--force', 256],
      zopflipng: ['-y', '--lossy_8bit', '--lossy_transparent'],
      jpegRecompress: ['--strip', '--quality', 'medium', '--min', 40, '--max', 80],
      mozjpeg: ['-optimize', '-progressive'],
      gifsicle: ['--optimize'],
      svgo: ['--enable', 'cleanupIDs', '--disable', 'convertColors']
    }))
    .pipe(gulp.dest('build/image'));
});

/* delete all build folder */

gulp.task('cleanFull', function() {
  return del('build');
});

/* delete build folder without image  */

gulp.task('clean', function() {
  return del(['build/*', '!build/image']);
});

/* copy all files for build without image */

gulp.task('copy', function() {
  return gulp.src([
    'source/image/*',
    ], {base: 'source'})
    .pipe(gulp.dest('build'));
});

/* server for test only product version */

gulp.task('serverTest', function() {
  browserSync.init({
    server: {
       baseDir: 'build'
    },
  });
});


/*----------------------------------------*/
/* config commands for development        */
/*----------------------------------------*/

/* console command: gulp start */

exports.start = gulp.series(
  'cssCompil',
  'serverDev'
);

/*----------------------------------------*/
/* config commands for production         */
/*----------------------------------------*/

/* console command: gulp fullbuild */

exports.fullbuild = gulp.series(
  gulp.parallel(
  'cssCompil',
  'cleanFull'
  ),
  'copy',
  gulp.parallel(
  'imageMin',
  'inlineStyle'
  ),
  'htmlMin'
);

/* console command: gulp build */

exports.build = gulp.series(
  'clean',
  'inlineStyle',
  'htmlMin'
);

/* console command: gulp testbuild */

exports.testbuild = gulp.series(
  'serverTest'
);
