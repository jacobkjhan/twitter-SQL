'use strict';
var express = require('express');
var app = express();
var morgan = require('morgan');
var nunjucks = require('nunjucks');
var makesRouter = require('./routes');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var bodyParser = require('body-parser');
var socketio = require('socket.io');

// templating boilerplate setup
app.engine('html', nunjucks.render); // how to render html templates
app.set('view engine', 'html'); // what file extension do our templates have
nunjucks.configure('views', { noCache: true }); // where to find the views, caching off

/* logging middleware
 *  morgan('dev') = function (req, res, next) {
 *    console.log('logging info');
 *    next();
 *  }
*/
app.use(morgan('dev'));

// body parsing middleware
app.use(bodyParser.urlencoded({ extended: true })); // for HTML form submits
app.use(bodyParser.json()); // would be for AJAX requests

/** a typical pattern for organizing middleware
 *
 * configuration middleware
 *  loggers, parsers, authentication middleware
 *
 * your routes
 *
 * error-handling 'endware' i.e. middleware that comes at the end ;)
 *  handling 404 not found, and also 500 server errors
*/

// start the server
var server = app.listen(1337, function(){
  console.log('listening on port 1337');
});
var io = socketio.listen(server);

// // We *could* define separate routes for each static resource stored on our server...
// app.get('/stylesheets/style.css', function (req, res, next) {
//   res.sendFile('/public/stylesheets/style.css');
// });

// // ...but Express gives us a way to check every incoming request to see if it matches a valid filepath for static resources
// app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname, '/public'))); // path.join helps resolve relative filepaths into absolute ones

// // express.static() returns a middleware function that runs for every matching request (all incoming requests in this case)
// function (req, res, next) {
//   // look for a file
//   // if found, res.sendFile(file)
//   // if not, next()
// }

// modular routing that uses io inside it
app.use('/', makesRouter(io));

// // manually-written static file middleware
// app.use(function(req, res, next){
//   var mimeType = mime.lookup(req.path);
//   fs.readFile('./public' + req.path, function(err, fileBuffer){
//     if (err) return next();
//     res.header('Content-Type', mimeType);
//     res.send(fileBuffer);
//   });
// });
