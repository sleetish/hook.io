/*
 * hookio/index.js
 *
 * The Index for the hookio module
 * Initializes and sets up a hook.io server session
 */

var events = require('events'),
  http_port = null,
  tcp_port = null;

// In case we want to run multiple instances at once
if (process.argv[2])
  http_port = parseInt(process.argv[2]);

// In case we want to run multiple instances at once
if (process.argv[3])
  tcp_port = parseInt(process.argv[3]);

// The HookIO object
var hookIO = {
  // Constants
  PATH: __dirname,
  HTTP_PORT: http_port || 8000,
  TCP_PORT: tcp_port || 8080,
  EMAIL_DEFAULTS: {
    'from': 'noreply@hook.io'
  }
};


// Inherit from EventEmitter
hookIO = (function() {
  var fn;
  (fn = new Function()).prototype = new events.EventEmitter();
  process.mixin(fn.prototype, hookIO);
  return new fn();
})();

exports.hookIO = hookIO;


// The setup function
exports.init = function() {
  // Set-up the server bits and pieces
  hookIO.outgoing = require('./outgoing');
  hookIO.incoming = require('./incoming');

  hookIO.hooker = require('./hooker');
  hookIO.hooker.update(function() {
    hookIO.actioner = require('./actioner');
    hookIO.actioner.update(function() {
      // Other services
      hookIO.db = require('./db');

      // Start http and tcp services
      hookIO.protocol.http = require('./protocols/http');
      hookIO.protocol.http.start();
      hookIO.protocol.twitter = require('./protocols/twitter');
      hookIO.protocol.twitter.start();
    });
  });

  // Make sure we aren't called again
  delete exports.init;
};