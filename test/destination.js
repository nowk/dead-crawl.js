/* jshint node: true */

var assert = require('chai').assert;
var deadCrawl = require('..');

describe('destination', function() {
  it("compiles destination data from the url", function() {
    var dest = deadCrawl.destination('http://example.com/path/to/page/#!/with/js');

    assert.deepEqual(dest, {
      filename: 'js.html',
      dirpath: 'path/to/page/with',
      path: 'path/to/page/with/js.html'
    });
  });

  it("allows the base pass to be set", function() {
    var opts = {destRoot: __dirname+'/public'};
    var dest = deadCrawl.destination('http://example.com/path/to/page/#!/with/js', opts);

    assert.deepEqual(dest, {
      filename: 'js.html',
      dirpath: opts.destRoot+'/path/to/page/with',
      path: opts.destRoot+'/path/to/page/with/js.html'
    });
  });

  it("removes any querystrings", function() {
    var dest = deadCrawl.destination('http://example.com/path/to/page/#!/with/js?id=12345');

    assert.deepEqual(dest, {
      filename: 'js.html',
      dirpath: 'path/to/page/with',
      path: 'path/to/page/with/js.html'
    });

    dest = deadCrawl.destination('http://example.com/path/to/page?sid=678/#!/with/js?id=12345');

    assert.deepEqual(dest, {
      filename: 'js.html',
      dirpath: 'path/to/page/with',
      path: 'path/to/page/with/js.html'
    });
  });

  it("allows the hashbang delimeter to be set", function() {
    var opts = {hashbang: '#'};
    var dest = deadCrawl.destination('http://example.com/path/to/page/#/with/js', opts);

    assert.deepEqual(dest, {
      filename: 'js.html',
      dirpath: 'path/to/page/with',
      path: 'path/to/page/with/js.html'
    });
  });

  it("keeps any existing extension", function() {
    var dest = deadCrawl.destination('http://example.com/path/to/page/#!/with/js.json');

    assert.deepEqual(dest, {
      filename: 'js.json',
      dirpath: 'path/to/page/with',
      path: 'path/to/page/with/js.json'
    });
  });
});
