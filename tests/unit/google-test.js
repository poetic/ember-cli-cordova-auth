/* globals match, localStorage, plugins: true */

import simpleModule from '../helpers/simple-module';
import stubRequest from '../helpers/stub-request';
import { test } from 'ember-qunit';

var googleSuccessResponse = {
  idToken: 'someVeryLongString...',
  email: 'daniel@poeticsystems.com',
  displayName: 'Daniel Ochoa',
  gender: 'male',
  imageUrl: 'http://link-to-my-profilepic.google.com',
  givenName: 'Daniel',
  middleName: null,
  familyName: 'Ochoa'
};

var googleFailResponse = {};

window.plugins = {
  googleplus: {
    login: function(permissions, s, f) {
      if (permissions) {
        s(googleSuccessResponse);
      } else {
        f(googleFailResponse);
      }
    }
  }
};

var session;
simpleModule('Initializers/CordovaAuth/Google', function(app, _session) {
  session = _session;
}, function() {
  session.signOut();
});

test('successful google sign in - sets isSignedIn to true', function() {
  expect(1);
  stubRequest('/sessions/google', {
    user: {
      email: 'example@example.com',
      access_token: '1234'
    }
  });

  return session.signInWithGoogle({
    'iOSApiKey': 'abcfds-...'
  }).then(function() {
    equal(session.get('isSignedIn'), true);
  }, function(err) {
    ok(false, 'GoogleSignIn Err: ', err);
  });
});

test('successful google sign in - sets properties on the session and localstorage', function() {
  expect(3);
  var properties = {
    user: {
      email: 'example@example.com',
      access_token: '1234',
    }
  };
  var user = properties.user;
  stubRequest('/sessions/google', properties);

  return session.signInWithGoogle({
    'iOSApiKey': 'abcd-123..'
  }).then(function() {
    equal(session.get('email'), user.email);
    equal(session.get('access_token'), user.access_token);
    var lsKey = session.localStorageKey();
    deepEqual(JSON.parse(localStorage.getItem(lsKey)), properties);
  });
});

test('failed google sign in - rejects', function() {
  expect(1);
  stubRequest('/sessions/google', {}, { status: 400 });

  return session.signInWithGoogle({
    'iOSApiKey': 'abcd-123...'
  }).then(function() {
    ok(false, 'Should have rejected');
  }, function() {
    ok(true);
  });
});

test('google sign in - requires access_token', function() {
  expect(1);
  stubRequest('/sessions/google', {
    user: {
      email: 'example@example.com'
    }
  });

  return session.signInWithGoogle({
    'iOSApiKey': 'abc-123...'
  }).then(function() {
    ok(false, 'Should have rejected');
  }, function() {
    ok(true);
  });
});
