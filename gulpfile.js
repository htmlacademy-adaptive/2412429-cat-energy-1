import gulp from 'gulp';
import include from 'gulp-include';
import gulpIf from 'gulp-if';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import sortMediaQueries from 'postcss-sort-media-queries';
import cssnano from 'cssnano';
import htmlmin from 'gulp-htmlmin';
import { htmlValidator } from 'gulp-w3c-html-validator';
import bemlinter from 'gulp-html-bemlinter';
import terser from 'gulp-terser';
import optimizeImages from 'gulp-imagemin';
import optimizeJpeg from 'imagemin-mozjpeg';
import optimizePng from 'imagemin-pngquant';
import optimizeSvg from 'imagemin-svgo';
import svgoConfig from './svgo.config.js';
import { stacksvg } from 'gulp-stacksvg';
import { deleteAsync } from 'del';
import webp from 'gulp-webp';
import browser from 'browser-sync';

const isBuild = process.env.npm_lifecycle_event === 'build';
const dist = isBuild ? 'build' : 'dev';

// Styles

const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: !isBuild })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      sortMediaQueries(),
      autoprefixer()
    ]))
    .pipe(gulpIf(isBuild, postcss([
      cssnano({
        preset: ['default', { cssDeclarationSorter: false }]
      })
    ])))
    .pipe(gulp.dest(`${dist}/css`, { sourcemaps: '.' }))
    .pipe(browser.stream());
};


// HTML

const html = () => {
  return gulp.src('source/*.html')
    .pipe(gulpIf(!isBuild, include()))
    .pipe(gulpIf(isBuild, htmlmin({
      collapseWhitespace: true,
      removeComments: true,
    })))
    .pipe(gulp.dest(dist));
};

export const lintHtml = () => {
  return gulp.src('source/*.html')
    .pipe(htmlValidator.analyzer({ ignoreMessages: /^Trailing slash/ }))
    .pipe(htmlValidator.reporter({ throwErrors: true }))
    .pipe(bemlinter());
};


// Scripts

const scripts = () => {
  return gulp.src('source/js/*.js')
    .pipe(gulpIf(isBuild, terser()))
    .pipe(gulp.dest(`${dist}/js`));
};


// Img

const images = () => {
  return gulp.src('public/img/*.{jpg,png,svg}')
    .pipe(
      optimizeImages([
        optimizePng({
          speed: 1,
          strip: true,
          dithering: 1,
          quality: [0.8, 0.9],
          optimizationLevel: 3
        }),
        optimizeJpeg({ progressive: true, quality: 75 }),
        optimizeSvg(svgoConfig)
      ])
    )
    .pipe(gulp.dest('build/img'));
};


const createWebp = () => {
  return gulp.src('public/img/**/*.{jpg,png}')
    .pipe(webp({ quality: 75 }))
    .pipe(gulp.dest(`${dist}/img`));
};


// Svg

export const createSprite = () => {
  return gulp.src('source/icons/**/*.svg')
    .pipe(optimizeImages([optimizeSvg(svgoConfig)]))
    .pipe(stacksvg())
    .pipe(gulp.dest(`${dist}/img`));
};


// Copy

const copy = () => {
  return gulp.src([
    'public/**',
    '!public/{img,pixelperfect}/**',
    '!public/**/README*'
  ])
    .pipe(gulp.dest('build'));
};


// Clean

const clean = () => {
  return deleteAsync(dist);
};


// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: [dist, 'public']
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};


// Reload

const reload = (done) => {
  browser.reload();
  done();
};


// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/**/*.js', gulp.series(scripts, reload));
  gulp.watch('source/*.html', gulp.series(html, reload));
  gulp.watch('{public}/img/**/*.{jpg,png}').on('all', (event, path) => {
    if (['add', 'change'].includes(event, path)) {
      const img = path.replace(/\\/g, '/');
      series(function createWebp() {
        return src(img)
          .pipe(webp({ quality: 75 }))
          .pipe(dest(img.replace(/^public\/(.*)\/.*/, `${dist}/$2`)));
      }, reload)();
    }
  });
  gulp.watch('source/icons/**/*.svg', gulp.series(createSprite, reload));
  gulp.watch('public/img/**', gulp.series(createWebp, reload));
  gulp.watch(['public/**', '!public/img/**'], reload);
};


// Build

export const build = gulp.series(
  clean,
  gulp.parallel(
    copy,
    images,
    styles,
    html,
    scripts,
    createSprite,
    createWebp
  )
);

export default gulp.series(
  clean,
  gulp.parallel(
    styles,
    html,
    scripts,
    createSprite,
    createWebp
  ),
  server,
  watcher
);
