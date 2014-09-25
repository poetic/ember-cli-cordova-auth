/* globals plugins */
import Ember from 'ember';

export default {
  signIn: function(settings) {
    if (typeof plugins === undefined) {
      var msg = 'Plugins are only available on the simulator or ';
      msg += 'on a real device.';
      return Ember.RSVP.reject(msg);
    }
    if (typeof plugins.googleplus === undefined) {
      var msg = 'The google plus plugin was not found. ';
      msg += '(https://github.com/poetic/cordova-plugin-';
      msg += 'googleplus)'
      return Ember.RSVP.reject(msg);
    }
    return new Ember.RSVP.Promise(function(resolve, reject) {
      plugins.googleplus.login(settings, resolve, reject);
    });
  }
};
