/* globals match, ENV: true, localStorage, facebookConnectPlugin: true */

import simpleModule from '../helpers/simple-module';
import stubRequest from '../helpers/stub-request';

var fbSuccessResponse = {
  authResponse: {
    accessToken: '1234'
  }
};

var fbFailResponse = {};

window.facebookConnectPlugin = {
  login: function(permissions, s, f) {
    if(permissions) {
      s(fbSuccessResponse);
    } else {
      f(fbFailResponse);
    }
  }
};

var session;
simpleModule('Initializers/CordovaAuth/Facebook', function(app, _session){
  ENV = {
    facebookSignInUrl: 'http://localhost:3000/api/v1/sessions/facebook'
  };
  session = _session;
}, function() {
  session.reset();
});

test('asserts ENV.signInUrl present', function() {
  expect(1);
  var temp = ENV;
  ENV = {};

  throws(function() {
    session.facebookSignInUrl();
  });

  ENV = temp;
});

asyncTest('successful facebook sign in - sets isSignedIn to true', function() {
  expect(1);
  stubRequest('/sessions/facebook', {
    email: 'example@example.com',
    access_token: '1234'
  });

  session.signInWithFacebook(['basic_info']).then(function() {
    equal(session.get('isSignedIn'), true);
    start();
  }, function(err) {
    console.log(arguments);
    ok(false, 'FacebookSignIn Err: ', err);
    start();
  });
});

asyncTest('successful facebook sign in - sets properties on the session and localstorage', function() {
  expect(6);
  var properties = {
    email: 'example@example.com',
    access_token: '1234',
    first_name: 'Jane',
    last_name: 'Doe',
    user_id: 1
  };
  stubRequest('/sessions/facebook', properties);

  session.signInWithFacebook({email: 'example@example.com', password: 'password'}).then(function() {
    equal(session.get('email'), properties.email);
    equal(session.get('access_token'), properties.access_token);
    equal(session.get('first_name'), properties.first_name);
    equal(session.get('last_name'), properties.last_name);
    equal(session.get('user_id'), properties.user_id);

    var lsKey = session.localStorageKey();
    deepEqual(JSON.parse(localStorage.getItem(lsKey)), properties);

    start();
  });
});
