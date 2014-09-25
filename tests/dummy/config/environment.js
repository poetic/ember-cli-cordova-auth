/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'dummy',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'auto';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  ENV.signInUrl              = 'http://localhost:3000/api/v1/sessions';
  ENV.signUpUrl              = 'http://localhost:3000/api/v1/sign_up';
  ENV.facebookSignInUrl      = 'http://localhost:3000/api/v1/sessions/facebook';
  ENV.googleSignInUrl        = 'http://localhost:3000/api/v1/sessions/google';
  ENV.resetPasswordUrl       = 'http://localhost:3000/api/v1/users/password';
  ENV.authTokenKey           = 'access_token';
  ENV.sessionLocalStorageKey = 'test-localstorage';

  return ENV;
};
