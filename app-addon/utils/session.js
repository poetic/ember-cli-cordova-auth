/* globals ENV */
import Ember from 'ember';
import icAjax from 'ic-ajax';
import Facebook from './facebook';

function assertENV() {
  Ember.assert('You must define a global ENV variable for ember-cli-cordova-auth to use. The easiest way is to put `window.ENV = {}`` in your app.js`', Ember.keys(ENV).length);
}

var get = Ember.get;

export default Ember.Object.extend({
  initializeState: function() {
    var storedSession = localStorage.getItem(this.localStorageKey());
    try {
      if(storedSession) {
        storedSession = JSON.parse(storedSession);
        this.setProperties(storedSession.user);
        this.setPrefilter();
      }
    } catch(e) {
      // Swallow this error since it's a JSON parse error
    }
  }.on('init'),

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

  facebookSignInUrl: function() {
    assertENV();
    Ember.assert('You must define a facebookSignInUrl property on the global ENV variable for ember-cli-cordova-auth to use.', ENV.facebookSignInUrl);
    return ENV.facebookSignInUrl;
  },

  resetPasswordUrl: function() {
    assertENV();
    Ember.assert('You must define a resetPasswordUrl property on the global ENV variable for ember-cli-cordova-auth to use.', ENV.resetPasswordUrl);
    return ENV.resetPasswordUrl;
  },

  authTokenKey: function() {
    assertENV();
    Ember.assert('You must define an authTokenKey property on the global ENV variable for ember-cli-cordova-auth to use.', ENV.authTokenKey);
    return ENV.authTokenKey;
  },

  localStorageKey: function() {
    assertENV();
    return ENV.sessionLocalStorageKey || 'ember-cordova-auth';
  },

  save: function(data) {
    localStorage.setItem(this.localStorageKey(), JSON.stringify(data));
    this.setProperties(data.user);
  },

  isSignedIn: Ember.computed.notEmpty(ENV.authTokenKey),

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
        if(get(userData.user, session.authTokenKey())) {
          session.save(userData);
          session.set('isSignedIn', true);
          session.setPrefilter();
          resolve(userData);
        } else {
          reject('An ' + session.authTokenKey() + ' must be present in the session creation response.');
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

  resetPassword: function(data) {
    var session = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      icAjax(session.resetPasswordUrl(), {
        method: 'POST',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json'
      }).then(resolve, reject);
    });
  },

  signInWithFacebook: function(permissions) {
    var session = this;
    return Facebook.signIn(permissions).then(function(response){
      return session._postData(session.facebookSignInUrl(), response);
    });
  },

  setPrefilter: function() {
    var authToken = this.get(this.authTokenKey());

    if(Ember.isNone(authToken)) {
      return false;
    }

    Ember.$.ajaxPrefilter(function(options) {
      if (!options.beforeSend) {
        options.beforeSend = function (xhr) {
          xhr.setRequestHeader('Authorization', authToken);
        };
      }
    });

    return true;
  }
});
