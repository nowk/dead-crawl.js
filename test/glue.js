/* jshint node: true */

var assert = require('chai').assert;
var glue = require('..').glue;

describe('glue', function() {
  var req;

  beforeEach(function() {
    req = {
      protocol: 'http',
      host: 'example.com',
      path: '/path/to/page',
      app: {
        settings:{port: 80}
      },
      query: {}
    };
  });

  it("builds the js url from _escaped_fragment_", function() {
    req.query._escaped_fragment_ = "/do/js";
    var url = glue(req);
    assert.equal(url, "http://example.com:80/path/to/page/#!/do/js");

    req.query._escaped_fragment_ = "/do/js";
    url = glue(req, '#');
    assert.equal(url, "http://example.com:80/path/to/page/#/do/js");

    req.query._escaped_fragment_ = "/";
    url = glue(req);
    assert.equal(url, "http://example.com:80/path/to/page/#!/");

    req.query._escaped_fragment_ = "";
    url = glue(req);
    assert.equal(url, "http://example.com:80/path/to/page/#!");
  });
});
