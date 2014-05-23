/* jshint node: true */

var t = require('./test_helper');
var assert = require('chai').assert;
var fs = require('fs');
var Q = require('q');
var path = require('path');
var request = require('supertest');
var sinon = require('sinon');
var WalkingDead = require('walking-dead');

var deadCrawl = require('..').deadCrawl;


describe('DeadCrawl', function() {
  this._timeout = 9999;
  var url = 'http://localhost:1337';
  var app;
  var server;

  beforeEach(function(done) {
    resetRequire();

    app = require('./app');
    app.middlewares()
      .before('static', {name: 'routes', fn: function() {
        app
          .get('/', function(req, res, next) {
            res.render("./app");
          })
          .get("/path/to/page(.:format)?", function(req, res, next) {
            res.render('./app');
          });
      }});
    done();
  });

  afterEach(function(done) {
    server.close(function() {
      resetRequire();

      Q
        .allSettled([
          t.unlink('./index.html'),
          t.unlink('./path/to/page.html'),
          t.unlink('./test/public/index.html'),
          t.unlink('./path/to/page/with/js.html'),
          t.unlink('./test/public/crawls/path/to/page.html')
        ])
        .then(function() {
          done();
        });
    });
  });


  it('visits the url and saves the html to file', function(done) {
    var zombify = sinon.spy(WalkingDead.prototype, 'zombify');

    var opts = {destRoot: __dirname+'/public/crawls'};
    app.middlewares()
      .before('routes', {name: 'dead-crawl', cb: deadCrawl(opts)})
      .finish();

    server = app.listen(1337, function() {
      request('http://localhost:1337/')
        .get("/")
        .query({_escaped_fragment_: "/path/to/page"})
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          var html = res.text;
          assert(/Awesome Title/.test(html));
          assert(fs.existsSync(opts.destRoot+"/path/to/page.html"));

          request('http://localhost:1337/')
            .get("/")
            .query({_escaped_fragment_: "/path/to/page"})
            .expect(200)
            .end(function(err, res) {
              if (err) {
                return done(err);
              }

              var html = res.text;
              assert(/Awesome Title/.test(html));
              assert(zombify.calledOnce);
              zombify.restore();
              done();
            });
        });
    });
  });

  it('can execute functions before writing', function(done) {
    function waitForMetaDescription(browser, _, next) {
      var i = 0;
      var waiting = setInterval(function() {
        var desc = browser.query('meta[name="description"]')
          .attributes
          .content
          ._nodeValue;

        i++;
        if (!!desc || i > 10) {
          next();
        }
      }, 100);
    }

    function removeNgApp(browser, next) {
      next(null, browser.html().replace(/\sng\-app="\w+"/, ''));
    }

    var opts = {
      destRoot: __dirname+'/public/crawls',
      beforeWriter: [
        waitForMetaDescription,
        removeNgApp
      ]
    };
    app.middlewares()
      .before('routes', {name: 'dead-crawl', cb: deadCrawl(opts)})
      .finish();

    server = app.listen(1337, function() {
      request('http://localhost:1337/')
        .get("/")
        .query({_escaped_fragment_: "/path/to/page"})
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          var html = res.text;
          assert(!/ng-app/.test(html));
          assert(/Awesome Title/.test(html));
          assert(fs.existsSync(opts.destRoot+"/path/to/page.html"));
          done();
        });
    });
  });
});


/*
 * clear require cache
 */

function resetRequire() {
  delete require.cache[require.resolve('./app')];
  delete require.cache[require.resolve('..')];
}

