const gulp = require('gulp');
const nunjucksRender = require('gulp-nunjucks-render');
const sass = require('gulp-sass')(require('sass'));
const fibers = require('fibers');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const clean = require('gulp-clean');
const tap = require('gulp-tap');

gulp.task('clean', function() {
    return gulp.src([
        './index.html',
        './vendor.css'
    ], {read: true, allowEmpty: true})
    .pipe(clean({ force: true }));
});

gulp.task('njkToHtml', function() {
    let _isFistNjkConverter = true;

    return gulp.src([
      './component/*.njk',
      './index.njk'
    ])
    .pipe(tap(function(file) {
      const filePath = file.path.replace(/\\/g, '/');

      // NOTE split file.path và lấy tên file cùng tên folder để rename đúng tên cho file njk phía tmp
      const filename = filePath.split('/').slice(-2)[1];

      if(
        filename !== 'index.njk' &&
        _isFistNjkConverter
      ) {
        return;
      }

      gulp.src('./index.njk')
      .pipe(nunjucksRender({
        ext: '.html',
      }))
      .pipe(gulp.dest('./'))
      .on('end', function() {
        _isFistNjkConverter = false;
      });
    }))
});

gulp.task('sassToCss', function() {
    return gulp.src('./vendor.scss')
    .pipe(sass({
        fiber: fibers,
    }))
    .pipe(postcss([autoprefixer(
        {
            remove: false,
            browsersList: [
                'Chrome >= 35',
                'Firefox >= 38',
                'Edge >= 12',
                'Explorer >= 10',
                'iOS >= 8',
                'Safari >= 8',
                'Android 2.3',
                'Android >= 4',
                'Opera >= 12',
            ],
        }
    )]))
    .pipe(gulp.dest('./'));
});

gulp.task('watchLayout', function() {
  (function() {
    gulp.watch([
      './component/*.njk',
      './index.njk'
    ], gulp.series(
      'njkToHtml',
    ));
  })();
  (function() {
    gulp.watch('./vendor.scss', gulp.series(
      'sassToCss',
    ));
  })()
});

gulp.task('layout', gulp.series(
    'clean',
    'sassToCss',
    'njkToHtml',
    'watchLayout',
));
