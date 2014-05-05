/* jshint node: true */

var assert = require('chai').assert;
var Browser = require('zombie');
var fs = require('fs');
var Q = require('q');

var app = require('./app');
var DeadCrawl = require('..');

app.get("/path/to/page(.:format)", function(req, res, next) {
  res.render('./app');
});


describe('DeadCrawl', function() {
  this._timeout = 9999;
  var browser;
  var url = 'http://localhost:1337';

  before(function(done) {
    app.listen(1337, done);
  });

  // beforeEach(function() {
  //   browser = new Browser({debug: true, silent: false});
  // });

  it('visits the url and saves the html to file', function(done) {
    new DeadCrawl(url)
      .zombify()
      .then(function() {
        fs.lstat('index.html', function(err, stats) {
          if (err) {
            return done(err);
          }
          done();
        });
      });
  });

  it('saves the file based on the url path', function(done) {
    var dca = new DeadCrawl(url);
    assert.deepEqual(dca.dest, {
      file: 'index.html',
      dir: '/',
      path: '/index.html',
    });

    var pathurl = url+'/path/to/page?foo=bar';
    var dcb = new DeadCrawl(pathurl);
    assert.deepEqual(dcb.dest, {
      file: 'page.html',
      dir: '/path/to',
      path: '/path/to/page.html',
    });

    var pathurlwext = url+'/path/to/page.html';
    new DeadCrawl(pathurlwext)
      .zombify()
      .then(function() {
        fs.lstat('./path/to/page.html', function(err, stats) {
          if (err) {
            return done(err);
          }
          done();
        });
      });
  });


  describe('middleware', function() {
    it('executes DeadCrawl with url contains ?_escaped_fragment');
  });
});

