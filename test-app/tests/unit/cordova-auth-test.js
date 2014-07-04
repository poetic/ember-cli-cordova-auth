/* globals match, ENV: true, localStorage */

import simpleModule from '../helpers/simple-module';
import stubRequest from '../helpers/stub-request';

var session;
simpleModule('Initializers/CordovaAuth', function(app, _session){
  ENV = {
    createSessionUrl: 'http://localhost:3000/api/v1/sessions'
  };
  session = _session;
}, function() {
  session.reset();
});

test('exists', function() {
  ok(session);
});

test('asserts ENV present', function() {
  expect(1);
  var temp = ENV;
  ENV = {};

  throws(function() {
    session.createSessionUr();
  });

  ENV = temp;
});

test('asserts ENV.createSessionUrl present', function() {
  expect(1);
  var temp = ENV.createSessionUrl;

  ENV.createSessionUrl = null;

  throws(function() {
    session.createSessionUrl();
  });

  ENV.createSesionUrl = temp;
});

test('createSessionUrl is configured in ENV', function() {
  equal(session.createSessionUrl(), ENV.createSessionUrl);
});

test('sessionLocalStorageKey can be configured in ENV', function() {
  ENV.sessionLocalStorageKey = 'test-localstorage';
  var lsKey = session.localStorageKey();

  equal(lsKey, ENV.sessionLocalStorageKey);
});

asyncTest('successful authentication - sets isAuthenticated to true', function() {
  expect(1);
  stubRequest('/sessions', {
    email: 'example@example.com',
    access_token: '1234'
  });

  session.authenticate('example@example.com', 'password').then(function() {
    equal(session.get('isAuthenticated'), true);
    start();
  });
});

asyncTest('successful authentication - sets properties on the session and localstorage', function() {
  expect(6);
  var properties = {
    email: 'example@example.com',
    access_token: '1234',
    first_name: 'Jane',
    last_name: 'Doe',
    user_id: 1
  };
  stubRequest('/sessions', properties);

  session.authenticate('example@example.com', 'password').then(function() {
    equal(session.get('email'), 'example@example.com');
    equal(session.get('access_token'), '1234');
    equal(session.get('first_name'), 'Jane');
    equal(session.get('last_name'), 'Doe');
    equal(session.get('user_id'), 1);

    var lsKey = session.localStorageKey();
    deepEqual(JSON.parse(localStorage.getItem(lsKey)), properties);

    start();
  });
});

asyncTest('successful authentication - requres an access_token in the response', function() {
  expect(1);
  stubRequest('/sessions', {
    email: 'example@example.com'
  });

  session.authenticate('example@example.com', 'password').then(function() {
  }, function(err) {
    match('An access_token must', err);
    start();
  });
});

asyncTest('successful authentication - reset() resets values', function() {
  expect(4);
  stubRequest('/sessions', {
    email: 'example@example.com',
    access_token: '1234',
  });

  session.authenticate('example@example.com', 'password').then(function() {
    session.reset();
    equal(session.get('email'), null);
    equal(session.get('access_token'), null);
    equal(session.get('isAuthenticated'), false);

    var lsKey = session.localStorageKey();
    equal(localStorage.getItem(lsKey), null);

    start();
  });
});

asyncTest('successful authentication - setPrefilter is called', function() {
  expect(1);
  stubRequest('/sessions', {
    email: 'example@example.com',
    access_token: '1234'
  });

  var _setPrefilter = session.setPrefilter;
  session.setPrefilter = function() {
    var addedPrefilter = _setPrefilter.apply(this, arguments);
    equal(addedPrefilter, true);
    start();
  };

  session.authenticate('example@example.com', 'password');
});

asyncTest('failed authentication - sets isAuthenticated to false', function() {
  expect(1);
  stubRequest('/sessions', {}, { status: 400 });

  session.authenticate('example@example.com', 'password').then(function() {}, function() {
    equal(session.get('isAuthenticated'), false);
    start();
  });
});

