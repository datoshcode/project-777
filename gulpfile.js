const { src, dest, watch, parallel, series } = require('gulp');

const scss          = require('gulp-sass'); 
const concat        = require('gulp-concat');
const browserSync   = require('browser-sync').create();
const uglify        = require('gulp-uglify-es').default;
const autoprefixer  = require('gulp-autoprefixer');
const imagemin      = require('gulp-imagemin');
const del           = require('del');

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/'
  }
  });
}

function cleanDist() {
  return del('dist')
}

function images() {
  return src('app/images/**/*')
  .pipe(imagemin(
    [
    imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({
        plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
        ]
    })
]
))
  .pipe(dest('dist/images'))
}

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'app/js/main.js'
  ])
  .pipe(concat('main.min.js'))
  .pipe(uglify())
  .pipe(dest('app/js'))
  .pipe(browserSync.stream())
}

function styles() {
  return src('app/scss/style.scss')
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 version'],
      grid: true 
    }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

// Сборка в отдельный проект
function build() {
  return src([
    'app/css/style.min.css',
    'app/fonts/**/*',
    'app/js/main.min.js',
    'app/*.html'
  ], {base: 'app'})
  .pipe(dest('dist'))
}

function watching() {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/*.html']).on('change', browserSync.reload);
}

// gulp styles - Преобразовать *.scss в .css и сохранить в app/css
exports.styles = styles; 
// gulp watching - Следить за изменениями в проекте
exports.watching = watching; 
// gulp browsersync - Запустить browsersync в live режиме
exports.browsersync = browsersync;
// gulp scripts - Следить за изменениями в скриптах JS
exports.scripts = scripts;
// gulp images - Сжатие изображений и сохранение в /dist/images
exports.images = images;
// gulp del - Удалить папку /dist
exports.cleanDist = cleanDist;


// gulp - Запуск всех команд. Для остановки процесса - Ctrl+C.
exports.default = parallel(styles, scripts, browsersync, watching);
// gulp build - Сборка проекта в /dist
exports.build = series(cleanDist, images, build);