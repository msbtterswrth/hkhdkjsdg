const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const gulpif = require('gulp-if');
const fs = require('fs');

// Configuration
const config = {
  src: {
    scss: 'src/assets/scss/styles.scss',
    scssWatch: 'src/assets/scss/**/*.scss',

    js: [
      'src/assets/js/components/**/*.js',
      'src/assets/js/script.js',
    ],

    html: './*.html',
    fonts: 'src/assets/fonts/**/*',
  },

  dest: {
    css: 'src/assets/build/css',
    js: 'src/assets/build/js',
    dist: 'dist',
    distAssets: 'dist/assets',
    rootAssets: 'assets',
  },

  isProduction: process.env.NODE_ENV === 'production',
};

// Ensure destination directories exist.
function ensureDirectoriesExist() {
  [
    config.dest.css,
    config.dest.js,
    config.dest.dist,
    config.dest.distAssets,
    config.dest.rootAssets,
  ].forEach((directory) => {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, {
        recursive: true,
      });
    }
  });
}

// Convert a Gulp stream to a Promise.
function streamToPromise(stream) {
  return new Promise((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}

// Remove generated files.
async function clean() {
  const { deleteAsync } = await import('del');

  return deleteAsync(
    [
      'src/assets/build/**/*',
      `${config.dest.dist}/**/*`,
      `${config.dest.rootAssets}/**/*`,
    ],
    {
      force: true,
    }
  );
}

// Compile, prefix, and minify Sass.
function styles() {
  ensureDirectoriesExist();

  return gulp
    .src(config.src.scss)
    .pipe(gulpif(!config.isProduction, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(
      postcss([
        autoprefixer(),
        cssnano(),
      ])
    )
    .pipe(
      rename({
        basename: 'styles',
        suffix: '.min',
      })
    )
    .pipe(
      gulpif(
        !config.isProduction,
        sourcemaps.write('.')
      )
    )
    .pipe(gulp.dest(config.dest.css));
}

// Concatenate and minify all JavaScript components.
function scripts() {
  ensureDirectoriesExist();

  return gulp
    .src(config.src.js, {
      allowEmpty: true,
    })
    .pipe(gulpif(!config.isProduction, sourcemaps.init()))
    .pipe(concat('script.js'))
    .pipe(
      terser().on('error', function handleTerserError(error) {
        console.error(error);
        this.emit('end');
      })
    )
    .pipe(
      rename({
        suffix: '.min',
      })
    )
    .pipe(
      gulpif(
        !config.isProduction,
        sourcemaps.write('.')
      )
    )
    .pipe(gulp.dest(config.dest.js));
}

// Copy HTML files into dist.
function html() {
  ensureDirectoriesExist();

  return gulp
    .src(config.src.html, {
      allowEmpty: true,
    })
    .pipe(gulp.dest(config.dest.dist));
}

// Copy compiled assets and fonts into dist/assets.
function assets() {
  ensureDirectoriesExist();

  const css = gulp
    .src(`${config.dest.css}/**/*`, {
      allowEmpty: true,
    })
    .pipe(gulp.dest(`${config.dest.distAssets}/build/css`));

  const js = gulp
    .src(`${config.dest.js}/**/*`, {
      allowEmpty: true,
    })
    .pipe(gulp.dest(`${config.dest.distAssets}/build/js`));

  const fonts = gulp
    .src(config.src.fonts, {
      allowEmpty: true,
      encoding: false,
    })
    .pipe(gulp.dest(`${config.dest.distAssets}/fonts`));

  return Promise.all([
    streamToPromise(css),
    streamToPromise(js),
    streamToPromise(fonts),
  ]);
}

// Copy the completed dist build back to the project root for GitHub Pages.
//
// encoding: false is required so binary files such as fonts are not corrupted.
function publish() {
  ensureDirectoriesExist();

  return gulp
    .src(`${config.dest.dist}/**/*`, {
      base: config.dest.dist,
      allowEmpty: true,
      encoding: false,
    })
    .pipe(gulp.dest('./'));
}

// Start BrowserSync using the project root.
function serve(done) {
  browserSync.init({
    server: {
      baseDir: './',
    },
    notify: false,
  });

  done();
}

// Reload BrowserSync.
function reload(done) {
  browserSync.reload();
  done();
}

// Compile styles, copy to dist, publish to root, and reload.
const buildStyles = gulp.series(
  styles,
  assets,
  publish,
  reload
);

// Compile scripts, copy to dist, publish to root, and reload.
const buildScripts = gulp.series(
  scripts,
  assets,
  publish,
  reload
);

// Copy fonts to dist, publish to root, and reload.
const copyFonts = gulp.series(
  assets,
  publish,
  reload
);

// Copy HTML to dist, publish to root, and reload.
const buildHtml = gulp.series(
  html,
  publish,
  reload
);

// Watch source files.
function watchFiles() {
  gulp.watch(
    config.src.scssWatch,
    buildStyles
  );

  gulp.watch(
    config.src.js,
    buildScripts
  );

  gulp.watch(
    config.src.fonts,
    copyFonts
  );

  gulp.watch(
    config.src.html,
    buildHtml
  );
}

// Compile all source files into dist.
const compile = gulp.series(
  gulp.parallel(styles, scripts),
  gulp.parallel(html, assets)
);

// Build dist and always publish it to the project root.
const build = gulp.series(
  clean,
  compile,
  publish
);

// Build, publish, serve from the root, and watch for changes.
const dev = gulp.series(
  clean,
  compile,
  publish,
  gulp.parallel(serve, watchFiles)
);

// Exports.
exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.html = html;
exports.assets = assets;
exports.publish = publish;
exports.build = build;
exports.dev = dev;
exports.default = dev;