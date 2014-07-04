/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var app = new EmberApp();

if(app.tests) {
  app.import('vendor/jquery-mockjax/jquery.mockjax.js');
}

module.exports = app.toTree();
