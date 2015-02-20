import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    signInFb: function() {
      this.session.signInWithFacebook(['public_profile', 'email']).then(function(ret) {
        console.log(ret);
      }, function(error) {
        alert('there was an error using fb login');
        console.log(error);
      });
    }
  }
});
