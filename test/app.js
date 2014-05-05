/* jshint node: true */

var express = require('express');


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

app.use(express.static(__dirname+'/public'));

// app.listen(1337, function() {
//   console.log('server on 1337');
// });

