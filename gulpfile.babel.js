import gulp from 'gulp'
import babel from 'gulp-babel'
import postcss from 'gulp-postcss'
import eslint from 'gulp-eslint'
import htmlMinify from 'gulp-htmlmin'
import nodemon from 'gulp-nodemon'

const paths = {
	styles: 'app/**/*.css',
	scripts: 'app/**/*.js',
	html: 'app/**/*.html',
	dest: 'dist'
}

export const build = gulp.parallel(es5, css, html)
export const start = gulp.parallel(serve, gulp.series(build, watch))

export function es5 () {
	return gulp.src(paths.scripts)
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError())
		.pipe(babel())
		.pipe(gulp.dest(paths.dest))
}


export function css () {
	return gulp.src(paths.styles)
		.pipe(postcss({}))
		.pipe(gulp.dest(paths.dest))
}

//https://github.com/kangax/html-minifier#options-quick-reference
export function html () {
	return gulp.src(paths.html)
		.pipe(htmlMinify({collapseWhitespace: true}))
		.pipe(gulp.dest(paths.dest))
}

export function watch () {
	gulp.watch(paths.scripts, es5)
	gulp.watch(paths.styles, css)
	gulp.watch(paths.html, html)
}

export function serve() {
	nodemon({
		script: 'index.js',
		exec: 'babel-node'
	})
}

export default start
