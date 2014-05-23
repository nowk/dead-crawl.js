/* jshint node: true */

var express = require('express');
var MiddleEarth = require('middle-earth');


/*
 * expose
 */

var app = module.exports = express();


/*
 * configure
 */

app.set('port', process.env.PORT || 1337);
app.set('views', __dirname+'/views');
app.set('view engine', 'jade');

app.middlewares([
  {name: 'static', cb: express.static(__dirname+'/public')}
]);

