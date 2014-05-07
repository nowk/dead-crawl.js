/* jshint node: true */

var t = require('./test_helper');
var assert = require('chai').assert;
var Browser = require('zombie');
var fs = require('fs');
var Q = require('q');
var path = require('path');
var app = require('./app');

/*
 * root
 */

app.get('/', function(req, res, next) {
  res.render("./app");
});


/*
 * pathed route
 */

app.get("/path/to/page(.:format)?", function(req, res, next) {
  res.render('./app');
});


var DeadCrawl = require('..');


describe('DeadCrawl', function() {
  this._timeout = 9999;
  var url = 'http://localhost:1337';
  var server;

  before(function(done) {
    server = app.listen(1337, done);
  });

  afterEach(function(done) {
    Q
      .allSettled([
        t.unlink('./index.html'),
        t.unlink('./path/to/page.html'),
        t.unlink('./test/public/index.html'),
        t.unlink('./path/to/page/with/js.html')
      ])
      .then(function() {
        done();
      });
  });

  after(function(done) {
    server.close(done);
  });

  it('visits the url and saves the html to file', function(done) {
    new DeadCrawl(url)
      .zombify()
      .then(DeadCrawl.writer())
      .done(function(html) {
        fs.lstat('index.html', function(err, stats) {
          if (err) {
            return done(err);
          }
          done();
        });
      });
  });

  it('handles pathed urls', function(done) {
    new DeadCrawl(url+'/path/to/page.html')
      .zombify()
      .then(DeadCrawl.writer())
      .done(function(html) {
        fs.lstat('./path/to/page.html', function(err, stats) {
          if (err) {
            return done(err);
          }
          done();
        });
      });
  });

  it("handles urls with hashbang", function(done) {
    new DeadCrawl(url+"/path/to/page/#!/with/js")
      .zombify()
      .then(DeadCrawl.writer())
      .done(function(html) {
        fs.lstat('./path/to/page/with/js.html', function(err, stats) {
          if (err) {
            return done(err);
          }
          done();
        });
      });
  });

  it("can override the hasbang delimiter", function(done) {
    new DeadCrawl(url+"/path/to/page/#/with/js")
      .zombify()
      .then(DeadCrawl.writer({hashBang: '#'}))
      .done(function(html) {
        fs.lstat('./path/to/page/with/js.html', function(err, stats) {
          if (err) {
            return done(err);
          }
          done();
        });
      });
  });

  it("can override destination root path", function(done) {
    new DeadCrawl(url)
      .zombify()
      .then(DeadCrawl.writer({destRoot: __dirname+'/public/'}))
      .done(function(html) {
        fs.lstat('./test/public/index.html', function(err, stats) {
          if (err) {
            return done(err);
          }
          done();
        });
      });
  });


  it("strips out query string", function(done) {
    new DeadCrawl(url+'/#!/path/to/page?id=12345')
      .zombify()
      .then(DeadCrawl.writer())
      .done(function(html) {
        fs.lstat('./path/to/page.html', function(err, stats) {
          if (err) {
            return done(err);
          }
          done();
        });
      });
  });

  it('can stack onto the promise chain', function(done) {
    function waitForMetaDescription() {
      return function(browser) {
        var d = Q.defer();
        var i = 0;
        var waiting = setInterval(function() {
          var desc = browser
            .query('meta[name="description"]')
            .attributes
            .content
            ._nodeValue;

          if (!!desc || i > 4) {
            clearInterval(waiting);
            d.resolve(browser);
          }

          i++;
        }, 100);
        return d.promise;
      };
    }

    function removeNgApp() {
      return function(browser) {
        var d = Q.defer();
        var html = browser.html().replace(/\sng\-app="\w+"/, '');
        d.resolve([browser, html]);
        return d.promise;
      };
    }

    new DeadCrawl(url)
      .zombify()
      .then(waitForMetaDescription())
      .then(removeNgApp())
      .then(DeadCrawl.writer())
      .done(function(html) {
        assert(!/ng-app/.test(html));
        assert(/Awesome Title/.test(html));
        fs.lstat('index.html', function(err, stats) {
          if (err) {
            return done(err);
          }
          done();
        });
      });
  });
});

