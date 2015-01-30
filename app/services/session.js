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
  initializeState: Ember.on('init', function() {
    var storedSession = localStorage.getItem(this.localStorageKey());
    try {
      if(storedSession) {
        storedSession = JSON.parse(storedSession);
        this.setProperties(storedSession.user);
        this.setPrefilter();
      }
    } catch(e) {
      Ember.assert('JSON parse error at services/session.js:initializeState()');
    }
    window.$session = this;
  }),

  signInUrl:          assertConfig('signInUrl'),
  signUpUrl:          assertConfig('signUpUrl'),
  facebookSignInUrl:  assertConfig('facebookSignInUrl'),
  googleSignInUrl:    assertConfig('googleSignInUrl'),
  resetPasswordUrl:   assertConfig('resetPasswordUrl'),

  drupalServicesApi: function() {
    return config.drupalServicesApi || false;
  },

  authTokenKey: function() {
    return this.drupalServicesApi() ? 'token' : config.authTokenKey || 'access_token';
  },

  localStorageKey: function() {
    return config.sessionLocalStorageKey || 'ember-cordova-auth';
  },

  save: function(data) {
    localStorage.setItem(this.localStorageKey(), JSON.stringify(data));
    // this is setting the whole payload as properties on our session. tsk tsk.
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

        if (session.drupalServicesApi() && get(userData, session.authTokenKey())) {

          // tricky here. refactor
          var leanUser = {
            name: userData.user ? userData.user.name : null,
            mail: userData.user ? userData.user.mail : null,
            uid: userData.uid,
            token: userData.token
          };

          var tokenKey = session.authTokenKey();
          session.set(tokenKey, userData[tokenKey]);
          session.save(leanUser);
          session.set('isSignedIn', true);
          session.setPrefilter();
          resolve(userData);

        } else if(get(userData.user, session.authTokenKey())) {

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
    var header    = this.drupalServicesApi() ? 'X-CSRF-Token' : 'Authorization';

    Ember.$.ajaxPrefilter(function(options) {
      if (!options.beforeSend) {
        options.beforeSend = function (xhr) {
          // here here here for drupal changet to X-CSRF-Token
          xhr.setRequestHeader(header, authToken);
        };
      }
    });

    return true;
  }
});
