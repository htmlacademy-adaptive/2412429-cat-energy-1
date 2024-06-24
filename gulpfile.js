import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
// import squoosh from 'gulp-libsquoosh';
import optimizeImages from 'gulp-imagemin';
import optimizeJpeg from 'imagemin-mozjpeg';
import optimizePng from 'imagemin-pngquant';
import optimizeSvg from 'imagemin-svgo';
import svgoConfig from './svgo.config.js';
import { stacksvg } from 'gulp-stacksvg';
import { deleteAsync } from 'del';
import webp from 'gulp-webp';
import browser from 'browser-sync';


// Styles

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}


// HTML

const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
}


// Scripts

const scripts = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'));
}


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
    .pipe(gulp.dest('build/img'));
};


// Svg

export const createSprite = () => {
  return gulp.src('source/icons/**/*.svg')
    .pipe(optimizeImages([optimizeSvg(svgoConfig)]))
    .pipe(stacksvg())
    .pipe(gulp.dest('build/img'));
};


// Copy

const copy = () => {
  return gulp.src(['public', '!public/{img,pixelperfect}/**'])
    .pipe(gulp.dest('build'));
};



// Clean

const clean = () => {
  return deleteAsync('build');
};



// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: ['build', 'public']
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}


// Reload

const reload = (done) => {
  browser.reload();
  done();
}


// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/script.js', gulp.series(scripts, reload));
  gulp.watch('source/*.html', gulp.series(html, reload));
  gulp.watch('{public}/img/**/*.{jpg,png}').on('all', (event, path) => {
    if (['add', 'change'].includes(event, path)) {
      const img = path.replace(/\\/g, '/');
      series(function createWebp() {
        return src(img)
          .pipe(webp({ quality: 75 }))
          .pipe(dest(img.replace(/^public\/(.*)\/.*/, 'build/$2')));
      }, reload)();
    }
  });
  gulp.watch('source/icons/**/*.svg', gulp.series(createSprite, reload));
  gulp.watch('public/img/**', gulp.series(createWebp, reload));
  gulp.watch(['public/**', '!public/img/**'], reload);

}

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
)


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
