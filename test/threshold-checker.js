'use strict';

/*
The MIT License (MIT)

Copyright (c) 2015 Peter West

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

https://github.com/peterjwest/istanbul-threshold-checker
*/

var assert = require('assert');
var checker = require('../threshold-checker');
var istanbul = require('babel-istanbul');

describe('threshold-checker', function() {
  describe('checkThreshold', function() {
  	it('checks percentage threshold passes', function() {
  		var coverage = { total: 125, covered: 75, skipped: 0, pct: 60 };
  		assert.deepEqual(checker.checkThreshold(60, coverage), { failed: false, value: 60 });
  	});

  	it('checks percentage threshold fails', function() {
  		var coverage = { total: 125, covered: 75, skipped: 0, pct: 60 };
  		assert.deepEqual(checker.checkThreshold(80, coverage), { failed: true, value: 60 });
  	});

  	it('checks gap threshold passes', function() {
  		var coverage = { total: 50, covered: 40, skipped: 0, pct: 80 };
  		assert.deepEqual(checker.checkThreshold(-10, coverage), { failed: false, value: -10 });
  	});

  	it('checks gap threshold fails', function() {
  		var coverage = { total: 50, covered: 40, skipped: 0, pct: 80 };
  		assert.deepEqual(checker.checkThreshold(-5, coverage), { failed: true, value: -10 });
  	});

  	it('skips thresholds which are false', function() {
  		var coverage = { total: 50, covered: 40, skipped: 0, pct: 80 };
  		var expected = { failed: false, skipped: true };
  		assert.deepEqual(checker.checkThreshold(null, coverage), expected);
  		assert.deepEqual(checker.checkThreshold(undefined, coverage), expected);
  		assert.deepEqual(checker.checkThreshold(false, coverage), expected);
  		assert.deepEqual(checker.checkThreshold(0, coverage), expected);
  	});
  });

  describe('checkThresholds', function() {
  	it('checks all thresholds', function() {
  		var thresholds = { lines: -20, statements: 60, functions: -50, branches: 66 };
  		var coverage = {
  			lines: { total: 100, covered: 90, skipped: 0, pct: 90 },
  			statements: { total: 120, covered: 60, skipped: 0, pct: 50 },
  			functions: { total: 80, covered: 20, skipped: 0, pct: 25 },
  			branches: { total: 90, covered: 60, skipped: 0, pct: 66.67 }
  		};

  		assert.deepEqual(checker.checkThresholds(thresholds, coverage), [
  			{ value: -10, failed: false },
  			{ value: 50, failed: true },
  			{ value: -60, failed: true },
  			{ value: 66.67, failed: false }
  		]);
  	});

  	it('checks all thresholds in the same order, regardless of the coverage object', function() {
  		var thresholds = { lines: -20, statements: 60, functions: -50, branches: 66 };
  		var coverage = {
  			statements: { total: 120, covered: 60, skipped: 0, pct: 50 },
  			functions: { total: 80, covered: 20, skipped: 0, pct: 25 },
  			lines: { total: 100, covered: 90, skipped: 0, pct: 90 },
  			branches: { total: 90, covered: 60, skipped: 0, pct: 66.67 }
  		};

  		assert.deepEqual(checker.checkThresholds(thresholds, coverage), [
  			{ value: -10, failed: false },
  			{ value: 50, failed: true },
  			{ value: -60, failed: true },
  			{ value: 66.67, failed: false }
  		]);
  	});

  	it('checks thresholds using a single value', function() {
  		var thresholds = 60;
  		var coverage = {
  			lines: { total: 100, covered: 90, skipped: 0, pct: 90 },
  			statements: { total: 120, covered: 60, skipped: 0, pct: 50 },
  			functions: { total: 80, covered: 20, skipped: 0, pct: 25 },
  			branches: { total: 90, covered: 60, skipped: 0, pct: 66.67 }
  		};

  		assert.deepEqual(checker.checkThresholds(thresholds, coverage), [
  			{ value: 90, failed: false },
  			{ value: 50, failed: true },
  			{ value: 25, failed: true },
  			{ value: 66.67, failed: false }
  		]);
  	});
  });

  describe('checkFailures', function() {
  	beforeEach(function() {
      this.env = {
        summarizeCoverage: istanbul.utils.summarizeCoverage,
        summarizeFileCoverage: istanbul.utils.summarizeFileCoverage,
      };

  		istanbul.utils.summarizeCoverage = function () {
        return {
    			lines: { total: 100, covered: 90, skipped: 0, pct: 90 },
    			statements: { total: 120, covered: 60, skipped: 0, pct: 50 },
    			functions: { total: 80, covered: 20, skipped: 0, pct: 25 },
    			branches: { total: 90, covered: 60, skipped: 0, pct: 66.67 }
        };
  		};

  		istanbul.utils.summarizeFileCoverage = (function () {
        var calls = 0;

        return function () {
          switch (calls++) {
            case 0:
              return {
                lines: { total: 100, covered: 80, skipped: 0, pct: 80 },
                statements: { total: 120, covered: 120, skipped: 0, pct: 100 },
                functions: { total: 80, covered: 80, skipped: 0, pct: 100 },
                branches: { total: 90, covered: 90, skipped: 0, pct: 100 }
              };
            default:
              return {
                lines: { total: 100, covered: 90, skipped: 0, pct: 90 },
                statements: { total: 120, covered: 60, skipped: 0, pct: 50 },
                functions: { total: 80, covered: 20, skipped: 0, pct: 25 },
                branches: { total: 90, covered: 90, skipped: 0, pct: 100 }
              };
          }
        };
      }());

  		this.coverage = {
  			'/file/test.js': {},
  			'/file/test2.js': {}
  		};
  	});

  	afterEach(function() {
  		istanbul.utils.summarizeCoverage = this.env.summarizeCoverage;
      istanbul.utils.summarizeFileCoverage = this.env.summarizeFileCoverage;
  	});

  	it('checks global and per file thresholds', function() {
  		var thresholds = {
  			global: { lines: 90, statements: 100, functions: 100, branches: 100 },
  			each: { lines: 100, statements: 100, functions: 100, branches: 100 }
  		};

  		assert.deepEqual(checker.checkFailures(thresholds, this.coverage), [
  			{
  				type: 'lines',
  				global: { failed: false, value: 90 },
  				each: { failed: true, failures: ['/file/test.js', '/file/test2.js'] }
  			}, {
  				type: 'statements',
  				global: { failed: true, value: 50 },
  				each: { failed: true, failures: ['/file/test2.js'] }
  			}, {
  				type: 'functions',
  				global: { failed: true, value: 25 },
  				each: { failed: true, failures: ['/file/test2.js'] }
  			}, {
  				type: 'branches',
  				global: { failed: true, value: 66.67 },
  				each: { failed: false, failures: [] }
  			}
  		]);
  	});

  	it('checks simple thresholds', function() {
  		var thresholds = {
  			each: 90,
  			global: 80
  		};

  		assert.deepEqual(checker.checkFailures(thresholds, this.coverage), [
  			{
  				type: 'lines',
  				global: { failed: false, value: 90 },
  				each: { failed: true, failures: ['/file/test.js'] }
  			}, {
  				type: 'statements',
  				global: { failed: true, value: 50 },
  				each: { failed: true, failures: ['/file/test2.js'] }
  			}, {
  				type: 'functions',
  				global: { failed: true, value: 25 },
  				each: { failed: true, failures: ['/file/test2.js'] }
  			}, {
  				type: 'branches',
  				global: { failed: true, value: 66.67 },
  				each: { failed: false, failures: [] }
  			}
  		]);
  	});

  	it('checks only global thresholds', function() {
  		var thresholds = {
  			global: { lines: 90, statements: 100, functions: 100, branches: 100 }
  		};

  		assert.deepEqual(checker.checkFailures(thresholds, this.coverage), [
  			{ type: 'lines', global: { failed: false, value: 90 } },
  			{ type: 'statements', global: { failed: true, value: 50 } },
  			{ type: 'functions', global: { failed: true, value: 25 } },
  			{ type: 'branches', global: { failed: true, value: 66.67 } }
  		]);
  	});

  	it('checks only per file thresholds', function() {
  		var thresholds = {
  			each: { lines: 90, statements: 100, functions: 100, branches: 100 }
  		};

  		assert.deepEqual(checker.checkFailures(thresholds, this.coverage), [
  			{ type: 'lines', each: { failed: true, failures: ['/file/test.js'] } },
  			{ type: 'statements', each: { failed: true, failures: ['/file/test2.js'] } },
  			{ type: 'functions', each: { failed: true, failures: ['/file/test2.js'] } },
  			{ type: 'branches', each: { failed: false, failures: [] } }
  		]);
  	});
  });
});
