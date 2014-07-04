import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';

Ember.MODEL_FACTORY_INJECTIONS = true;

var App = Ember.Application.extend({
  modulePrefix: 'test-app', // TODO: loaded via config
  Resolver: Resolver
});

window.ENV = {
  createSessionUrl: 'http://localhost:3000/api/v1/sessions'
};

loadInitializers(App, 'test-app');

export default App;
