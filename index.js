/* jshint node: true */

var fs = require('fs');
var path = require('path');
var url = require('url');
var mkdirp = require('mkdirp');
var WalkingDead = require('walking-dead');

/*
 * deadCrawl middleware
 *
 * @param {Object} opts
 * @return {Function}
 * @api public
 */

exports.deadCrawl = function(opts) {
  opts = opts || {};

  var beforeWriter = opts.beforeWriter;
  delete opts.beforeWriter; // delete don't need to pass these around

  return function(req, res, next) {
    if ('_escaped_fragment_' in req.query) {
      var url = glue(req, opts.hashbang);
      var snapshot = destination(url, opts);

      // check for existing snapshot
      fs.exists(snapshot.path, function(exists) {
        if (!exists) {
          var wd = new WalkingDead(url).zombify()
            .given(function(browser, next) {
              next(null, null); // pass go, but curry one arg slot on the next step
            });

          (beforeWriter||[]).forEach(function(fn) {
            wd.then(fn);
          });

          wd.then(function(browser, html, next) {
              html = html || browser.html();
              write(snapshot, html, function() {
                next(null, html);
              });
            })
            .then(function(browser, html) {
              res.send(html);
            })
            .end();
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

/*
 * expose glue
 */

exports.glue = glue;

/*
 * glue together the actual js url from _escaped_fragment_
 *
 * @param {Request} req
 * @param {String} hashbang
 * @return {String}
 * @api private
 */

function glue(req, hashbang) {
  var url = req.protocol+'://';
  url+= req.host;
  url+= ":"+req.app.settings.port;
  return url+= path.join(req.path, (hashbang||'#!'), req.query._escaped_fragment_);
}

/*
 * expose destination
 */

exports.destination = destination;

/*
 * configure destination from url
 *
 * @param {String} uri
 * @param {Object} opts
 * @return {Object}
 * @api private
 */

function destination(uri, opts) {
  opts = opts || {};

  var _url = url.parse(uri);
  var pathname = _url.pathname;
  var hash = _url.hash && trimqs(_url.hash.replace(opts.hashbang||"#!", ''));

  // combine pathname with hash path
  if (!!hash) {
    pathname = path.join(pathname, hash);
  }

  // if / set as index
  if ('/' === pathname) {
    pathname = 'index';
  }

  // form the final destination path
  pathname = path.join(opts.destRoot||'.', pathname);
  var ext = path.extname(pathname);

  if (!!!ext || '.' === ext) {
    pathname = pathname+= '.html';
  }

  return {filename: path.basename(pathname), dirpath: path.dirname(pathname), path:  pathname};
}

/*
 * trims querystring `?xx=xxx'
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function trimqs(str) {
  return str.replace(/\?.*$/, '');
}

/*
 * write html to file
 *
 * @param {Object} dest
 * @param {String} html
 * @param {Function} callback
 * @api private
 */

function write(dest, html, callback) {
  mkdirp(dest.dirpath, function(err) {
    if (err) {
      throw err;
    }

    fs.writeFile(dest.path, html, {encoding: 'utf-8'}, function(err) {
      if (err) {
        throw err;
      }

      callback();
    });
  });
}
