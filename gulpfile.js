const srcPath = './src'
const distPath = './dist'
const path = {
	dist: {
		html: distPath + '/',
		css: distPath + '/css',
		img: distPath + '/img',
		favicon: distPath + '/img/favicon',
		js: distPath + '/js'
	},
	src: {
		html: [srcPath + '/*.html', '!' + srcPath + '/**/_*.html'],
		css: srcPath + '/less/main.less',
		img: srcPath + '/img/**/*.{jpg,png,svg,gif,webp}',
		svg: srcPath + '/svg/*.svg',
		favicon: srcPath + '/favicon/logo.png',
		js: srcPath + '/js/main.js'
	},
	watch: {
		html: srcPath + '/**/*.html',
		css: srcPath + '/less/**/*.less',
		img: srcPath + '/img/**/*.{jpg,png,svg,gif,webp}',
		svg: srcPath + '/svg/**/*.svg',
		favicon: srcPath + '/favicon/logo.png',
		js: srcPath + '/js/**/*.js'
	}
}

const gulp = require('gulp')
const {
	src,
	dest,
	watch,
	series,
	parallel
} = gulp
const del = require('del')
const fileInclude = require('gulp-file-include')
const htmlMin = require('gulp-htmlmin')
const browserSync = require('browser-sync').create()
const less = require('gulp-less')
const autoprefixer = require('gulp-autoprefixer')
const ggcmq = require('gulp-group-css-media-queries')
const cleanCss = require('gulp-clean-css')
const rename = require('gulp-rename')
const imageMin = require('gulp-imagemin')
const webp = require('gulp-webp')
const svgSprite = require('gulp-svg-sprite')
const svgMin = require('gulp-svgmin')
const cheerio = require('gulp-cheerio')
const replace = require('gulp-replace')
const favicons = require('favicons').stream
const webpHTML = require('gulp-webp-html')
const webpCSS = require('gulp-webp-css')
const sourceMap = require('gulp-sourcemaps')
const webpack = require('webpack-stream')

function delDist() {
	return del(distPath)
}

function html() {
	return src(path.src.html)
		.pipe(fileInclude())
		// .pipe(webpHTML())
		.pipe(htmlMin({
			collapseWhitespace: true
		}))
		.pipe(dest(path.dist.html))
		.pipe(browserSync.stream())
}

function css() {
	return src(path.src.css)
		.pipe(sourceMap.init())
		.pipe(less())
		.pipe(webpCSS())
		.pipe(ggcmq())
		.pipe(autoprefixer({
			overrideBrowserslist: ["cover 99.5%"]
		}))
		.pipe(dest(path.dist.css))
		.pipe(cleanCss({
			level: 2
		}))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(sourceMap.write('../maps'))
		.pipe(dest(path.dist.css))
		.pipe(browserSync.stream())
}

function img() {
	return src(path.src.img)
		.pipe(webp({
			quality: 75
		}))
		.pipe(dest(path.dist.img))
		.pipe(src(path.src.img))
		.pipe(imageMin([
			imageMin.gifsicle({
				interlaced: true
			}),
			imageMin.mozjpeg({
				quality: 75,
				progressive: true
			}),
			imageMin.optipng({
				optimizationLevel: 5
			}),
			imageMin.svgo({
				plugins: [{
						removeViewBox: false
					},
					{
						cleanupIDs: false
					}
				]
			})
		]))
		.pipe(dest(path.dist.img))
		.pipe(browserSync.stream())
}

function sprite() {
	return src(path.src.svg)
		.pipe(svgMin({
			multipass: true,
			js2svg: {
				pretty: true,
				indent: 2
			}
		}))
		.pipe(cheerio({
			run: function ($, file) {
				$('[fill]').removeAttr('fill');
				$('[stroke]').removeAttr('stroke');
				$('[style]').removeAttr('style');
			},
			parserOptions: {
				xmlMode: true
			}
		}))
		.pipe(replace('&gt;', '>'))
		.pipe(svgSprite({
			mode: {
				symbol: {
					sprite: "../iconsSprite.svg",
					example: true
				}
			}
		}))
		.pipe(dest(path.dist.img))
		.pipe(browserSync.stream())
}

function favicon() {
	return src(path.src.favicon)
		.pipe(favicons({
			path: "/", // Path for overriding default icons path. `string`
			appName: null, // Your application's name. `string`
			appShortName: null, // Your application's short_name. `string`. Optional. If not set, appName will be used
			appDescription: null, // Your application's description. `string`
			developerName: null, // Your (or your developer's) name. `string`
			developerURL: null, // Your (or your developer's) URL. `string`
			dir: "auto", // Primary text direction for name, short_name, and description
			lang: "en-US", // Primary language for name and short_name
			background: "#fff", // Background colour for flattened icons. `string`
			theme_color: "#fff", // Theme color user for example in Android's task switcher. `string`
			appleStatusBarStyle: "black-translucent", // Style for Apple status bar: "black-translucent", "default", "black". `string`
			display: "standalone", // Preferred display mode: "fullscreen", "standalone", "minimal-ui" or "browser". `string`
			orientation: "any", // Default orientation: "any", "natural", "portrait" or "landscape". `string`
			scope: "/", // set of URLs that the browser considers within your app
			start_url: "/?homescreen=1", // Start URL when launching the application from a device. `string`
			version: "1.0", // Your application's version string. `string`
			logging: false, // Print logs to console? `boolean`
			pixel_art: false, // Keeps pixels "sharp" when scaling up, for pixel art.  Only supported in offline mode.
			loadManifestWithCredentials: false, // Browsers don't send cookies when fetching a manifest, enable this to fix that. `boolean`
			icons: {
				// Platform Options:
				// - offset - offset in percentage
				// - background:
				//   * false - use default
				//   * true - force use default, e.g. set background for Android icons
				//   * color - set background for the specified icons
				//   * mask - apply mask in order to create circle icon (applied by default for firefox). `boolean`
				//   * overlayGlow - apply glow effect after mask has been applied (applied by default for firefox). `boolean`
				//   * overlayShadow - apply drop shadow after mask has been applied .`boolean`
				//
				android: false, // Create Android homescreen icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
				appleIcon: false, // Create Apple touch icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
				appleStartup: false, // Create Apple startup images. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
				coast: false, // Create Opera Coast icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
				favicons: true, // Create regular favicons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
				firefox: false, // Create Firefox OS icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
				windows: false, // Create Windows 8 tile icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
				yandex: false, // Create Yandex browser icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
			},
			html: "index.html",
			pipeHTML: true,
			replace: true,
		}))
		.pipe(dest(path.dist.favicon))
		.pipe(browserSync.stream())
}

const isDev = !process.argv.includes('--prod')

function js() {
	return src(path.src.js)
		.pipe(webpack({
			output: {
				filename: 'main.min.js'
			},
			module: {
				rules: [{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env']
						}
					}
				}]
			},
			mode: isDev ? 'development' : 'production',
			devtool: isDev ? 'eval-sourcemap' : 'none'
		}))
		.pipe(dest(path.dist.js))
		.pipe(browserSync.stream())
}

function startWatchAll() {
	watch(path.watch.html, html)
	watch(path.watch.css, css)
	watch(path.watch.img, img)
	watch(path.watch.svg, sprite)
	watch(path.watch.favicon, favicon)
	watch(path.watch.js, js)
}

function startBrowserSync() {
	browserSync.init({
		server: {
			baseDir: path.dist.html
		},
		notify: false
	})
}

const build = series(delDist, parallel(html, css, img, sprite, favicon, js))
const startWatching = series(build, parallel(startBrowserSync, startWatchAll))

exports.default = startWatching

//gulp build --prod