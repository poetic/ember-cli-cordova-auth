import Ember from 'ember';
import startApp from './start-app';

export default function(name, setupFn, teardownFn) {
  var App, session;

  module(name, {
    setup: function(){
      App = startApp();
      session = App.__container__.lookup('session:main');
      if(setupFn) {
        setupFn(App, session);
      }
    },
    teardown: function() {
      Ember.$.mockjaxClear();
      if(teardownFn) {
        teardownFn(App);
      }
      Ember.run(App, 'destroy');
    }
  });

  return App;
}
