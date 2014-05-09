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
 * @param {String} url
 * @constructor
 */

function DeadCrawl(url) {
  this.url = url;
}


/*
 * visit via zombie
 *
 * @param {Object} opts
 * @return {Promise}
 * @api public
 */

DeadCrawl.prototype.zombify = function(opts) {
  if ('undefined' === typeof opts) {
    opts = {debug: false, silent: true};
  }

  var d = Q.defer();
  var browser = new Browser(opts);
  browser
    .visit(this.url)
    .then(d.resolve.bind(d, browser))
    .fail(d.reject);
  return d.promise;
};


/*
 * writer utility
 *
 * @param {Object} opts
 * @return {Promise}
 * @api public
 */

DeadCrawl.writer = function(opts) {
  return function(browser) {
    var d = Q.defer();
    var html;

    // Q only takes one value. browser (Zombie) always need to be passed to
    // parse location but, we may also want to parse html and pass that back as
    // the final to write vs. calling html() on browser
    if (browser instanceof Array) {
      html = browser[1];
      browser = browser[0];
    }

    var dest = DeadCrawl.destination.call(browser, opts);

    if (!!!html) {
      html = browser.html();
    }

    write.call(dest, html)
      .then(d.resolve)
      .fail(d.reject)
      .done(function() {
        browser.close();
      });
    return d.promise;
  };
};


/*
 * configure destination
 *
 * @param {Object} opts
 * @return {Object}
 * @api public
 */

DeadCrawl.destination = function(opts) {
  if ('undefined' === typeof opts) {
    opts = {};
  }

  var browser = this;
  var uri = browser.location;
  var pathname = uri.pathname;
  var hash = uri.hash;

  if (!!hash) {
    pathname = Path
      .join(pathname, hash.replace((opts.hashBang || '#!'), ''));
  }

  if ('/' === pathname) {
    pathname = 'index';
  }

  pathname = Path
    .join((opts.destRoot || '.'), pathname)
    .replace(/\?.*$/, '') // TODO what best is way to handle? not all urls are pretty
    .replace(/\.\w+$/, '')+'.html';

  return {
    file: Path.basename(pathname),
    dir: Path.dirname(pathname),
    path: pathname
  };
};


/*
 * write html to file
 *
 * @param {String} html
 * @return {Promise}
 * @api private
 */

function write(html) {
  var self = this;
  var d = Q.defer();
  mkdirp(self.dir, function(err) {
    if (err) {
      return d.reject(err);
    }

    fs
      .writeFile(self.path, html, {encoding: 'utf-8'}, function(err) {
        if (err) {
          return d.reject(err);
        }

        d.resolve(html);
      });
  });
  return d.promise;
}


/*
 * middleware
 *
 * @param {Function} crawl
 * @param {Object} opts
 * @return {Function}
 */

DeadCrawl.middleware = function(crawl, opts) {
  if ('undefined' === typeof opts) {
    opts = {};
  }

  return function(req, res, next) {
    if ('_escaped_fragment_' in req.query) {
      var path = req.query._escaped_fragment_;
      var snapshot = DeadCrawl.destination.call({location: {pathname: path}}, opts);

      // check for existing snapshot
      fs.exists(snapshot.path, function(exists) {
        if (!exists) {
          var url = process.env.DEADCRAWL_HOST ||
            req.protocol+'://'+req.host+':'+req.app.settings.port;

          if ("/" !== path) {
            url+= '/'+Path.join((opts.hashBang || '#!'), path);
          }

          crawl(url, opts, res);
        } else {
          var cached = fs.createReadStream(snapshot.path);
          cached.pipe(res);
        }
      });
    } else {
      next();
    }
  };
};

