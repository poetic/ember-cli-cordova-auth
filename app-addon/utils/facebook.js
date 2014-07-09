/* globals facebookConnectPlugin */
import Ember from 'ember';

export default {
  signIn: function(permissions) {
    if(typeof facebookConnectPlugin !== 'undefined') {
      return new Ember.RSVP.Promise(function(resolve, reject){
        facebookConnectPlugin.login(permissions, function(res) {
          if(res.authResponse.accessToken) {
            resolve(res);
          } else {
            reject('Error authenticating with Facebook. Please sign up or in with an email and password.');
          }
        }, reject);
      });
    } else {
      return Ember.RSVP.reject('Facebook login only available in app');
    }
  }
};
