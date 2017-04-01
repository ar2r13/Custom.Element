import gulp from 'gulp'
import babel from 'gulp-babel'
import postcss from 'gulp-postcss'
import eslint from 'gulp-eslint'
import htmlMinify from 'gulp-htmlmin'
import server from 'gulp-develop-server'

const paths = {
	styles: 'app/**/*.css',
	scripts: 'app/**/*.js',
	html: 'app/**/*.html',
	dest: 'public'
}

export const build = gulp.parallel(es5, css, html)
export const start = gulp.series(build, gulp.parallel(serve, watch))

export function es5 () {
	return gulp.src(paths.scripts)
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(babel({
			sourceMaps: 'inline'
		}))
		.on('error', ::console.error)
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
	gulp.watch('index.js', server.restart)
}

export function serve() {
	server.listen({
		path: 'index.js'
	})
}

export default start
