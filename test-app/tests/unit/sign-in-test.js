/* globals match, ENV: true, localStorage */

import simpleModule from '../helpers/simple-module';
import stubRequest from '../helpers/stub-request';
import { test } from 'ember-qunit';

var session;
simpleModule('Initializers/CordovaAuth/SignIn', function(app, _session){
  ENV = {
    signInUrl: 'http://localhost:3000/api/v1/sessions'
  };
  session = _session;
}, function() {
  session.reset();
});

test('exists', function() {
  ok(session);
});

test('asserts ENV.signInUrl present', function() {
  expect(1);
  var temp = ENV;
  ENV = {};

  throws(function() {
    session.signInUrl();
  });

  ENV = temp;
});

test('asserts ENV.signInUrl present', function() {
  expect(1);
  var temp = ENV.signInUrl;

  ENV.signInUrl = null;

  throws(function() {
    session.signInUrl();
  });

  ENV.createSesionUrl = temp;
});

test('signInUrl is configured in ENV', function() {
  equal(session.signInUrl(), ENV.signInUrl);
});

test('sessionLocalStorageKey can be configured in ENV', function() {
  ENV.sessionLocalStorageKey = 'test-localstorage';
  var lsKey = session.localStorageKey();

  equal(lsKey, ENV.sessionLocalStorageKey);
});

test('successful sign in - sets isSignedIn to true', function() {
  expect(1);
  stubRequest('/sessions', {
    email: 'example@example.com',
    access_token: '1234'
  });

  return session.signIn({email: 'example@example.com', password: 'password'}).then(function() {
    equal(session.get('isSignedIn'), true);
  });
});

test('successful sign in - sets properties on the session and localstorage', function() {
  expect(6);
  var properties = {
    email: 'example@example.com',
    access_token: '1234',
    first_name: 'Jane',
    last_name: 'Doe',
    user_id: 1
  };
  stubRequest('/sessions', properties);

  return session.signIn({email: 'example@example.com', password: 'password'}).then(function() {
    equal(session.get('email'), properties.email);
    equal(session.get('access_token'), properties.access_token);
    equal(session.get('first_name'), properties.first_name);
    equal(session.get('last_name'), properties.last_name);
    equal(session.get('user_id'), properties.user_id);

    var lsKey = session.localStorageKey();
    deepEqual(JSON.parse(localStorage.getItem(lsKey)), properties);

  });
});

test('successful sign in - requires an access_token in the response', function() {
  expect(1);
  stubRequest('/sessions', {
    email: 'example@example.com'
  });

  return session.signIn({email: 'example@example.com', password: 'password'}).then(function() {
    ok(false, 'Should not hit here');
  }, function(err) {
    match('An access_token must', err);
  });
});

test('successful sign in - reset() resets values', function() {
  expect(4);
  stubRequest('/sessions', {
    email: 'example@example.com',
    access_token: '1234',
  });

  return session.signIn({email: 'example@example.com', password: 'password'}).then(function() {
    session.reset();
    equal(session.get('email'), null);
    equal(session.get('access_token'), null);
    equal(session.get('isSignedIn'), false);

    var lsKey = session.localStorageKey();
    equal(localStorage.getItem(lsKey), null);
  });
});

test('successful sign in - setPrefilter is called', function() {
  expect(1);
  stubRequest('/sessions', {
    email: 'example@example.com',
    access_token: '1234'
  });

  var _setPrefilter = session.setPrefilter;
  session.setPrefilter = function() {
    var addedPrefilter = _setPrefilter.apply(this, arguments);
    equal(addedPrefilter, true);
  };

  return session.signIn({email: 'example@example.com', password: 'password'});
});

test('failed sign in - sets isSignedIn to false', function() {
  expect(1);
  stubRequest('/sessions', {}, { status: 400 });

  return session.signIn({email: 'example@example.com', password: 'password'})
    .then(function() {}, function() {
      equal(session.get('isSignedIn'), false);
    });
});

