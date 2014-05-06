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
}


/*
 * parse url to extract destination info
 *
 * @return {Object}
 * @api private
 */

DeadCrawl.prototype.__defineGetter__('dest', function() {
  var uri = Url.parse(this.url);
  var pathname = uri.pathname;
  var hash = uri.hash;

  if (!!hash) {
    hash = hash.replace(this.hashbang, '');
    pathname = Path.join(pathname, hash);
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
});



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
        d.resolve();
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

