/* jshint node: true */

var Q = require('q');
var fs = require('fs');
var app = require('./app');


/*
 * expose app
 */

exports.app = app;


/*
 * pathed route
 */

app.get("/path/to/page(.:format)", function(req, res, next) {
  res.render('./app');
});


/*
 * delete written out through tests
 *
 * @param {String} path
 * @return {Promise}
 */

exports.unlink = function(path) {
  var d = Q.defer();
  fs.unlink(path, function(err) {
    d.resolve();
  });
  return d.promise;
};

