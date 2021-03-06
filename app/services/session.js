import Ember from 'ember';
import icAjax from 'ic-ajax';
import Facebook from '../utils/facebook';
import Google from '../utils/google';
import config from '../config/environment';

var get = Ember.get;

function assertConfig(name) {
  return function() {
    var msg = 'ember-cli-cordova-auth: ';
    msg += 'You need to define a ' + name + 'property in your config/environment.js';
    Ember.assert(msg, config[name]);

    return config[name];
  }
}

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

  signInUrl:          assertConfig('signInUrl'),
  signUpUrl:          assertConfig('signUpUrl'),
  facebookSignInUrl:  assertConfig('facebookSignInUrl'),
  googleSignInUrl:    assertConfig('googleSignInUrl'),
  resetPasswordUrl:   assertConfig('resetPasswordUrl'),

  authTokenKey: function() {
    return config.authTokenKey || 'access_token';
  },

  localStorageKey: function() {
    return config.sessionLocalStorageKey || 'ember-cordova-auth';
  },

  save: function(data) {
    localStorage.setItem(this.localStorageKey(), JSON.stringify(data));
    this.setProperties(data.user);
  },

  isSignedIn: Ember.computed.notEmpty(config.authTokenKey),

  signOut: function() {
    var session = this;

    return new Ember.RSVP.Promise(function(resolve, reject) {
      try {
        localStorage.removeItem(session.localStorageKey());
        Ember.keys(session).forEach(function(key){
          session.set(key, null);
        });
        session.set('isSignedIn', false);
        resolve();
      } catch(e) {
        reject(e);
      }
    });
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
    return Facebook.signIn(permissions).then(function(response) {
      return session._postData(session.facebookSignInUrl(), response);
    });
  },

  signInWithGoogle: function(settings) {
    var session = this;
    return Google.signIn(settings).then(function(response) {
      return session._postData(session.googleSignInUrl(), response);
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
