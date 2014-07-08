/* global match, ENV: true, localStorage */

import simpleModule from '../helpers/simple-module';
import stubRequest from '../helpers/stub-request';
import { test } from 'ember-qunit';

var session;
simpleModule('Initializers/CordovaAuth/SignUp', function(app, _session){
  ENV = {
    signUpUrl: 'http://localhost:3000/api/v1/sign_up'
  };
  session = _session;
}, function() {
  session.reset();
});

test('asserts ENV.signUpUrl present', function() {
  expect(1);
  var temp = ENV;
  ENV = {};

  throws(function() {
    session.signUpUrl();
  });

  ENV = temp;
});

test('successful sign up - sets isSignedIn to true', function() {
  expect(1);
  stubRequest('/sign_up', {
    email: 'example@example.com',
    access_token: '1234'
  });

  return session.signUp({email: 'example@example.com', password: 'password'}).then(function() {
    equal(session.get('isSignedIn'), true);
  });
});

test('successful sign up - sets properties on the session and localstorage', function() {
  expect(6);
  var properties = {
    email: 'example@example.com',
    access_token: '1234',
    first_name: 'Jane',
    last_name: 'Doe',
    user_id: 1
  };
  stubRequest('/sign_up', properties);

  return session.signUp({email: 'example@example.com', password: 'password'}).then(function() {
    equal(session.get('email'), properties.email);
    equal(session.get('access_token'), properties.access_token);
    equal(session.get('first_name'), properties.first_name);
    equal(session.get('last_name'), properties.last_name);
    equal(session.get('user_id'), properties.user_id);

    var lsKey = session.localStorageKey();
    deepEqual(JSON.parse(localStorage.getItem(lsKey)), properties);
  });
});

test('successful sign up - requres an access_token in the response', function() {
  expect(1);
  stubRequest('/sign_up', {
    email: 'example@example.com'
  });

  return session.signUp({email: 'example@example.com', password: 'password'}).then(function() {
    ok(false, 'Should never be here');
  }, function(err) {
    match('An access_token must', err);
  });
});

test('successful sign up - setPrefilter is called', function() {
  expect(1);
  stubRequest('/sign_up', {
    email: 'example@example.com',
    access_token: '1234'
  });

  var _setPrefilter = session.setPrefilter;
  session.setPrefilter = function() {
    var addedPrefilter = _setPrefilter.apply(this, arguments);
    equal(addedPrefilter, true);
  };

  return session.signUp({email: 'example@example.com', password: 'password'});
});

test('failed sign up - sets isSignedIn to false', function() {
  expect(1);
  stubRequest('/sign_up', {}, { status: 400 });

  return session.signUp({email: 'example@example.com', password: 'password'})
    .then(function() {}, function() {
      equal(session.get('isSignedIn'), false);
    });
});

