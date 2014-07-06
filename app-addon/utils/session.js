/* globals ENV */
import Ember from 'ember';
import icAjax from 'ic-ajax';

function assertENV() {
  Ember.assert('You must define a global ENV variable for ember-cli-cordova-auth to use. The easiest way is to put `window.ENV = {}`` in your app.js`', Ember.keys(ENV).length);
}

export default Ember.Object.extend({
  signInUrl: function() {
    assertENV();
    Ember.assert('You must define a signInUrl property on the global ENV variable for ember-cli-cordova-auth to use.', ENV.signInUrl);
    return ENV.signInUrl;
  },

  signUpUrl: function() {
    assertENV();
    Ember.assert('You must define a signUpUrl property on the global ENV variable for ember-cli-cordova-auth to use.', ENV.signUpUrl);
    return ENV.signUpUrl;
  },

  localStorageKey: function() {
    assertENV();
    return ENV.sessionLocalStorageKey || 'ember-cordova-auth';
  },

  setSession: function() {
    var storedSession = localStorage.getItem(this.localStorageKey());
    try {
      if(storedSession) {
        storedSession = JSON.parse(storedSession);
        this.setProperties(storedSession);
        this.setPrefilter();
      }
    } catch(e) {
      // Swallow this error since it's a JSON parse error
    }
  }.on('init'),

  save: function(data) {
    localStorage.setItem(this.localStorageKey(), JSON.stringify(data));
    this.setProperties(data);
  },

  isSignedIn: false,

  reset: function() {
    var session = this;

    localStorage.removeItem(session.localStorageKey());
    Ember.keys(session).forEach(function(key){
      session.set(key, null);
    });
    session.set('isSignedIn', false);
  },

  _postData: function(url, data){
    var session = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      icAjax(url, {
        method: 'POST',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json'
      }).then(function(userData) {
        if(userData.access_token) {
          session.save(userData);
          session.set('isSignedIn', true);
          session.setPrefilter();
          resolve(userData);
        } else {
          reject('An access_token must be present in the session creation response.');
        }
      }, function(err) {
        session.set('isSignedIn', false);
        reject(err);
      });
    });
  },

  signIn: function(data) {
    return this._postData(this.signInUrl(), data);
  },

  signUp: function(data) {
    return this._postData(this.signUpUrl(), data);
  },

  setPrefilter: function() {
    var accessToken = this.get('access_token');

    if(Ember.isNone(accessToken)) {
      return false;
    }

    Ember.$.ajaxPrefilter(function(options) {
      if (!options.beforeSend) {
        options.beforeSend = function (xhr) {
          xhr.setRequestHeader('Authorization', accessToken);
        };
      }
    });

    return true;
  }
});
