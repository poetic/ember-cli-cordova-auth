/* globals match, localStorage, facebookConnectPlugin: true */

import simpleModule from '../helpers/simple-module';
import stubRequest from '../helpers/stub-request';
import { test } from 'ember-qunit';

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
  session = _session;
}, function() {
  session.signOut();
});

test('successful facebook sign in - sets isSignedIn to true', function() {
  expect(1);
  stubRequest('/sessions/facebook', {
    user: {
      email: 'example@example.com',
      access_token: '1234'
    }
  });

  return session.signInWithFacebook(['basic_info']).then(function() {
    equal(session.get('isSignedIn'), true);
  }, function(err) {
    ok(false, 'FacebookSignIn Err: ', err);
  });
});

test('successful facebook sign in - sets properties on the session and localstorage', function() {
  expect(6);
  var properties = {
    user: {
      email: 'example@example.com',
      access_token: '1234',
      first_name: 'Jane',
      last_name: 'Doe',
      id: 1
    }
  };
  var user = properties.user;
  stubRequest('/sessions/facebook', properties);

  return session.signInWithFacebook({email: 'example@example.com', password: 'password'}).then(function() {
    equal(session.get('email'), user.email);
    equal(session.get('access_token'), user.access_token);
    equal(session.get('first_name'), user.first_name);
    equal(session.get('last_name'), user.last_name);
    equal(session.get('id'), user.id);

    var lsKey = session.localStorageKey();
    deepEqual(JSON.parse(localStorage.getItem(lsKey)), properties);
  });
});

test('failed facebook sign in - rejects', function() {
  expect(1);
  stubRequest('/sessions/facebook', { }, { status: 400 });

  return session.signInWithFacebook(['basic_info']).then(function() {
    ok(false, 'Should have rejected');
  }, function() {
    ok(true);
  });
});

test('facebook sign in - requires access_token', function() {
  expect(1);
  stubRequest('/sessions/facebook', {
    user: {
      email: 'example@example.com'
    }
  });

  return session.signInWithFacebook(['basic_info']).then(function() {
    ok(false, 'Should have rejected');
  }, function(err) {
    ok(true);
  });
});
