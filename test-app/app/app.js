import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';

Ember.MODEL_FACTORY_INJECTIONS = true;

var App = Ember.Application.extend({
  modulePrefix: 'test-app', // TODO: loaded via config
  Resolver: Resolver
});

window.ENV = {
  signInUrl: 'http://localhost:3000/api/v1/sessions',
  signUpUrl: 'http://localhost:3000/api/v1/sign_up',
  authTokenKey: 'access_token'
};

loadInitializers(App, 'test-app');

export default App;
