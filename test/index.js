/* jshint node: true */

var t = require('./test_helper');
var assert = require('chai').assert;
var Browser = require('zombie');
var fs = require('fs');
var Q = require('q');
var app = t.app;

var DeadCrawl = require('..');


describe('DeadCrawl', function() {
  this._timeout = 9999;
  var url = 'http://localhost:1337';

  before(function(done) {
    app.listen(1337, done);
  });

  afterEach(function(done) {
    Q
      .allSettled([
        t.unlink('./index.html'),
        t.unlink('./path/to/page.html'),
        t.unlink('./test/public/index.html')
      ])
      .then(function() {
        done();
      });
  });

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
      dir: '.',
      path: './index.html',
    });

    var pathurl = url+'/path/to/page?foo=bar';
    var dcb = new DeadCrawl(pathurl);
    assert.deepEqual(dcb.dest, {
      file: 'page.html',
      dir: './path/to',
      path: './path/to/page.html',
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

  it("accepts a destination root path", function(done) {
    var dc = new DeadCrawl(url, __dirname+'/public/');

    assert.deepEqual(dc.dest, {
      file: 'index.html',
      dir: __dirname+'/public',
      path: __dirname+'/public/index.html'
    });

    dc
      .zombify()
      .then(function() {
        fs.lstat('./test/public/index.html', function(err, stats) {
          if (err) {
            return done(err);
          }
          done();
        });
      });
  });
});

