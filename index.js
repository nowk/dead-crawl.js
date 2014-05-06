/* jshint node: true */

var Browser = require('zombie');
var fs = require('fs');
var Q = require('q');
var Path = require('path');
var Url = require('url');
var mkdirp = require('mkdirp');


/*
 * expose
 */

module.exports = DeadCrawl;


/*
 * daed crawl
 *
 * @constructor
 */

function DeadCrawl(url, options) {
  if ('undefined' === typeof options) {
    options = {};
  }

  this.url = url;
  this.destroot = options.destroot || '.';
  this.hashbang = options.hashbang || '#!';
  this.browser = null;

  this.dest = configureDest.call(this);
}


/*
 * visit via zombie
 *
 * @return {Promise}
 * @api public
 */

DeadCrawl.prototype.zombify = function() {
  this.browser = new Browser({debug: false, silent: true});

  return this.browser
    .visit(this.url)
    .then(write.bind(this));
};


/*
 * configure destination
 *
 * @return {Object}
 * @api private
 */

function configureDest() {
  var uri = Url.parse(this.url);
  var pathname = uri.pathname;
  var hash = uri.hash;

  if (!!hash) {
    pathname = Path.join(pathname, hash.replace(this.hashbang, ''));
  }

  if ('/' === pathname) {
    pathname = 'index';
  }

  // - remove multi /
  // - remove ext
  // - add .html
  pathname = [this.destroot, pathname]
    .join("/")
    .replace(/\/{2,}/, '/')
    .replace(/\.\w+$/, '')+'.html';

  return {
    file: Path.basename(pathname),
    dir: Path.dirname(pathname),
    path: pathname
  };
}


/*
 * write html to file
 *
 * @return {Promise}
 * @api private
 */

function write() {
  var self = this;
  var d = Q.defer();

  mkdirp(self.dest.dir, function(err) {
    if (err) {
      return d.reject(err);
    }

    fs
      .writeFile(self.dest.path, self.browser.html(), {encoding: 'utf-8'}, function(err) {
        tearDown.call(self);

        if (err) {
          return d.reject(err);
        }
        d.resolve(self.browser.html());
      });
  });

  return d.promise;
}


/*
 * tear down when Zombie has done it's thang
 *
 * @api private
 */

function tearDown() {
  var self = this;

  process.nextTick(function() {
    self.browser.close();
  });
}


/*
 * middleware
 *
 * @param {String} url
 * @return {Function}
 */

DeadCrawl.middleware = function(url, options) {
  if ('undefined' === typeof options) {
    options = {};
  }

  return function(req, res, next) {
    if ('_escaped_fragment_' in req.query) {
      var uri = Url.parse(url);
      var path = req.query._escaped_fragment_;

      // build out the ajax url
      if ("/" !== path) {
        url = uri.protocol+'//'+Path.join(uri.host, (options.hashbang || '#!'), path);
      }

      var dc = new DeadCrawl(url, options);

      // if cached version is available send that back, else DeadCrawl
      fs.lstat(dc.dest.path, function(err) {
        if (err) {
          dc
            .zombify()
            .then(function(html) {
              res.send(html);
            });
        } else {
          var cached = fs.createReadStream(dc.dest.path);
          cached.pipe(res);
        }
      });
    } else {
      next();
    }
  };
};

