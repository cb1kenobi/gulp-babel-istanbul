# gulp-babel-istanbul

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Deps][david-image]][david-url]
[![Dev Deps][david-dev-image]][david-dev-url]

[Babel][babel] ES2015 transpiling and [Istanbul][istanbul] unit test coverage plugin for [gulp][gulp].

Works on top of any Node.js unit test framework.

## Installation

	npm install gulp-babel-istanbul --save-dev

## Example

In your `gulpfile.js`:

#### Node.js testing

The following example is a sort of "kitchen sink" example of how to use
`gulp-babel-istanbul`.

```javascript
var babel = require('gulp-babel');
var istanbul = require('gulp-babel-istanbul');
var injectModules = require('gulp-inject-modules');
var mocha = require('gulp-mocha');

gulp.task('coverage', function (cb) {
  gulp.src('src/**/*.js')
	.pipe(istanbul())
	.pipe(istanbul.hookRequire()) // or you could use .pipe(injectModules())
	.on('finish', function () {
	  gulp.src('test/**/*.js')
		.pipe(babel())
		.pipe(injectModules())
		.pipe(mocha())
		.pipe(babelIstanbul.writeReports())
    .pipe(babelIstanbul.enforceThresholds({ thresholds: { global: 90 } }))
		.on('end', cb);
	});
});
```

#### Browser testing

#### WARNING: Browser testing is untested and may or may not work :(

For browser testing, you'll need to write the files covered by istanbul in a directory from where you'll serve these files to the browser running the test. You'll also need a way to extract the value of the [coverage variable](#coveragevariable) after the test have runned in the browser.

Browser testing is hard. If you're not sure what to do, then I suggest you take a look at [Karma test runner](http://karma-runner.github.io) - it has built-in coverage using Istanbul.

```javascript
var istanbul = require('gulp-babel-istanbul');

gulp.task('test', function (cb) {
  gulp.src(['lib/**/*.js', 'main.js'])
  .pipe(istanbul()) // Covering files
  .pipe(gulp.dest('test-tmp/'))
  .on('finish', function () {
    gulp.src(['test/*.html'])
    .pipe(testFramework())
    .pipe(istanbul.writeReports()) // Creating the reports after tests ran
    .on('end', cb);
  });
});
```

API
--------------

### istanbul(opt)

Instrument files passed in the stream.

#### opt
Type: `Object` (optional)
```js
{
  coverageVariable: 'someVariable',
  ...other Instrumeter options...
}
```

##### coverageVariable
Type: `String` (optional)
Default: `'$$cov_' + new Date().getTime() + '$$'`

The global variable istanbul uses to store coverage

See also:
- [istanbul coverageVariable][istanbul-coverage-variable]
- [SanboxedModule][sandboxed-module-coverage-variable]

##### includeUntested
Type: `Boolean` (optional)
Default: `false`

Flag to include test coverage of files that aren't `require`d by any tests

See also:
- [istanbul "0% coverage" issue](https://github.com/gotwarlost/istanbul/issues/112)

##### instrumenter
Type: `Instrumenter` (optional)
Default: `istanbul.Instrumenter`

Custom Instrumenter to be used instead of the default istanbul one.

```js
var isparta = require('isparta');
var istanbul = require('gulp-babel-istanbul');

gulp.src('lib/**.js')
  .pipe(istanbul({
    instrumenter: isparta.Instrumenter
  }));
```

##### NOTE: I don't think you need to use isparta since we use [babel-istanbul][babel-istanbul].

See also:
- [isparta](https://github.com/douglasduteil/isparta)

##### Other Istanbul Instrumenter options

See:
- [istanbul Instrumenter documentation][istanbul-coverage-variable]

### istanbul.hookRequire()

Overwrite `require` so it returns the covered files. The method take an optional [option object](https://gotwarlost.github.io/istanbul/public/apidocs/classes/Hook.html#method_hookRequire).

Always use this option if you're running tests in Node.js

### istanbul.summarizeCoverage(opt)

get coverage summary details

#### opt
Type: `Object` (optional)
```js
{
  coverageVariable: 'someVariable'
}
```
##### coverageVariable
Type: `String` (optional)
Default: `'$$cov_' + new Date().getTime() + '$$'`

The global variable istanbul uses to store coverage

See also:
- [istanbul coverageVariable][istanbul-coverage-variable]
- [SanboxedModule][sandboxed-module-coverage-variable]

#### returns
Type: `Object`
```js
{
  lines: { total: 4, covered: 2, skipped: 0, pct: 50 },
  statements: { total: 4, covered: 2, skipped: 0, pct: 50 },
  functions: { total: 2, covered: 0, skipped: 0, pct: 0 },
  branches: { total: 0, covered: 0, skipped: 0, pct: 100 }
}
```

See also:
- [istanbul utils.summarizeCoverage()][istanbul-summarize-coverage]


### istanbul.writeReports(opt)

Create the reports on stream end.

#### opt
Type: `Object` (optional)
```js
{
  dir: './coverage',
  reporters: [ 'lcov', 'json', 'text', 'text-summary', CustomReport ],
  reportOpts: { dir: './coverage' },
  coverageVariable: 'someVariable'
}
```

You can pass individual configuration to a reporter.
```js
{
  dir: './coverage',
  reporters: [ 'lcovonly', 'json', 'text', 'text-summary', CustomReport ],
  reportOpts: {
    lcov: {dir: 'lcovonly', file: 'lcov.info'}
    json: {dir: 'json', file: 'converage.json'}
  },
  coverageVariable: 'someVariable'
}
```
##### dir
Type: `String` (optional)
Default: `./coverage`

The folder in which the reports are to be outputted.

##### reporters
Type: `Array` (optional)
Default: `[ 'lcov', 'json', 'text', 'text-summary' ]`

The list of available reporters:
- `clover`
- `cobertura`
- `html`
- `json`
- `lcov`
- `lcovonly`
- `none`
- `teamcity`
- `text`
- `text-summary`

You can also specify one or more custom reporter objects as items in the array. These will be automatically registered with istanbul.

See also `require('istanbul').Report.getReportList()`

##### coverageVariable
Type: `String` (optional)
Default: `'$$cov_' + new Date().getTime() + '$$'`

The global variable istanbul uses to store coverage

See also:
- [istanbul coverageVariable][istanbul-coverage-variable]
- [SanboxedModule][sandboxed-module-coverage-variable]


### istanbul.enforceThresholds(opt)

Checks coverage against minimum acceptable thresholds. Fails the build if any of the thresholds are not met.

#### opt
Type: `Object` (optional)
```js
{
  coverageVariable: 'someVariable',
  thresholds: {
    global: 60,
    each: -10
  }
}
```

##### coverageVariable
Type: `String` (optional)
Default: `'$$cov_' + new Date().getTime() + '$$'`

The global variable istanbul uses to store coverage


##### thresholds
Type: `Object` (required)

Minimum acceptable coverage thresholds. Any coverage values lower than the specified threshold will fail the build.

Each threshold value can be:
- A positive number - used as a percentage
- A negative number - used as the maximum amount of coverage gaps
- A falsey value will skip the coverage

Thresholds can be specified across all files (`global`) or per file (`each`):
```
{
  global: 80,
  each: 60
}
```

You can also specify a value for each metric:
```
{
  global: {
    statements: 80,
    branches: 90,
    lines: 70,
    functions: -10
  }
  each: {
    statements: 100,
    branches: 70,
    lines: -20
  }
}
```

#### emits

A plugin error in the stream if the coverage fails

License
------------

[MIT License](http://en.wikipedia.org/wiki/MIT_License) (c) Simon Boudrias - 2013

[istanbul]: http://gotwarlost.github.io/istanbul/
[gulp]: https://github.com/gulpjs/gulp

[npm-image]: https://img.shields.io/npm/v/gulp-babel-istanbul.svg
[npm-url]: https://npmjs.org/package/gulp-babel-istanbul

[downloads-image]: https://img.shields.io/npm/dm/gulp-babel-istanbul.svg
[downloads-url]: https://npmjs.org/package/gulp-babel-istanbul

[istanbul-coverage-variable]: http://gotwarlost.github.io/istanbul/public/apidocs/classes/Instrumenter.html
[istanbul-summarize-coverage]: http://gotwarlost.github.io/istanbul/public/apidocs/classes/ObjectUtils.html#method_summarizeCoverage
[sandboxed-module-coverage-variable]: https://github.com/felixge/node-sandboxed-module/blob/master/lib/sandboxed_module.js#L240

[babel]: https://babeljs.io
[babel-istanbul]: https://www.npmjs.com/package/babel-istanbul

[gulp-babel]: https://www.npmjs.com/package/gulp-babel

[istanbul-threshold-checker]: https://www.npmjs.com/package/istanbul-threshold-checker

[david-image]: https://img.shields.io/david/cb1kenobi/gulp-babel-istanbul.svg
[david-url]: https://david-dm.org/cb1kenobi/gulp-babel-istanbul
[david-dev-image]: https://img.shields.io/david/dev/cb1kenobi/gulp-babel-istanbul.svg
[david-dev-url]: https://david-dm.org/cb1kenobi/gulp-babel-istanbul#info=devDependencies
