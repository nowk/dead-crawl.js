/* jshint node: true */

var t = require('./test_helper');
var assert = require('chai').assert;
var request = require('supertest');
var fs = require('fs');
var Q = require('q');
var sinon = require('sinon');

var DeadCrawl = require('..');


describe('middleware', function() {
  this._timeout = 9999;
  var url = 'http://localhost:1337/';
  var app, server;

  beforeEach(function() {
    resetRequire();
    app = require('./app');
  });

  afterEach(function(done) {
    server.close(function() {
      resetRequire();
      Q
        .allSettled([
          t.unlink('./test/public/crawls/path/to/page.html')
        ])
        .then(function(results) {
          done();
        });
    });
  });

  it('responds to crawlers using ?_escaped_fragment_=', function(done) {
    var cache = sinon.spy(fs, 'createReadStream');

    app.use(DeadCrawl.middleware(url, {destroot: __dirname+'/public/crawls'}));
    app.get("/", function(req, res, next) {
      res.render('./app');
    });

    server = app.listen(1337, function() {
      crawler(url, "/", "/path/to/page", 200)
        .then(function() {
          fs.lstat('./test/public/crawls/path/to/page.html', function(err) {
            if (err) {
              return done(err);
            }

            crawler(url, "/", "/path/to/page", 200)
              .then(function() {
                assert(cache.withArgs(__dirname+"/public/crawls/path/to/page.html").calledOnce);
                cache.restore();
                done();
              });
          });
        });
    });
  });
});


/*
 * clear require cache
 */

function resetRequire() {
  delete require.cache[require.resolve('./app')];
}


/*
 * crawler request
 *
 * @param {String} url
 * @param {String} path
 * @parma {String} fragment
 * @param {Number} status
 * @return {Promise}
 */

function crawler(url, path, fragment, status) {
  var d = Q.defer();
  request(url)
    .get(path)
    .query({_escaped_fragment_: fragment})
    .expect(status)
    .end(function(err) {
      if (err) {
        return d.reject(err);
      }
      d.resolve();
    });
  return d.promise;
}

