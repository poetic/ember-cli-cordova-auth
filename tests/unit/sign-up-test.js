/* global match, localStorage */

import simpleModule from '../helpers/simple-module';
import stubRequest from '../helpers/stub-request';
import { test } from 'ember-qunit';
import config from '../../config/environment';

var session;
simpleModule('Initializers/CordovaAuth/SignUp', function(app, _session){
  session = _session;
}, function() {
  session.reset();
});

test('successful sign up - sets isSignedIn to true', function() {
  expect(1);
  stubRequest('/sign_up', {
    user: {
      email: 'example@example.com',
      access_token: '1234'
    }
  });

  return session.signUp({email: 'example@example.com', password: 'password'}).then(function() {
    equal(session.get('isSignedIn'), true);
  });
});

test('successful sign up - sets properties on the session and localstorage', function() {
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
  stubRequest('/sign_up', properties);

  return session.signUp({email: 'example@example.com', password: 'password'}).then(function() {
    equal(session.get('email'), user.email);
    equal(session.get('access_token'), user.access_token);
    equal(session.get('first_name'), user.first_name);
    equal(session.get('last_name'), user.last_name);
    equal(session.get('id'), user.id);

    var lsKey = session.localStorageKey();
    deepEqual(JSON.parse(localStorage.getItem(lsKey)), properties);
  });
});

test('successful sign up - requres an access_token in the response', function() {
  expect(1);
  stubRequest('/sign_up', {
    user: {
      email: 'example@example.com'
    }
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
    user: {
      email: 'example@example.com',
      access_token: '1234'
    }
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

