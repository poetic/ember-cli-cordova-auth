/* globals facebookConnectPlugin */
import Ember from 'ember';

export default {
  success: function(response) {
    // authResponse is guaranteed to exist from the plugin
    if(response.authResponse.accessToken) {
      return Ember.RSVP.resolve(response);
    } else {
      return Ember.RSVP.reject('Error authenticating with Facebook. Please sign up or in with an email and password.');
    }
  },
  signIn: function(permissions) {
    var facebook = this;

    if(typeof facebookConnectPlugin !== 'undefined') {
      return new Ember.RSVP.Promise(function(resolve, reject){
        facebookConnectPlugin.login(permissions, function() {
          facebook.success.apply(facebook, arguments).then(resolve, reject);
        }, reject);
      });
    } else {
      return Ember.RSVP.reject('Facebook login only available in app');
    }
  }
};
