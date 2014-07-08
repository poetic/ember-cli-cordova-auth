/* globals match, ENV: true, localStorage, facebookConnectPlugin: true */

import simpleModule from '../helpers/simple-module';
import stubRequest from '../helpers/stub-request';
import { test } from 'ember-qunit';

var session;
simpleModule('Initializers/CordovaAuth/ResetPassword', function(app, _session){
  ENV = {
    resetPasswordUrl: 'http://localhost:3000/api/v1/users/password'
  };
  session = _session;
}, function() {
  session.reset();
});

test('asserts ENV.resetPasswordUrl present', function() {
  expect(1);
  var temp = ENV;
  ENV = {};

  throws(function() {
    session.resetPassowrdUrl();
  });

  ENV = temp;
});

test('successful password reset - resolves', function() {
  expect(1);
  stubRequest('/users/password', {});

  return session.resetPassword().then(function() {
    ok(true, 'Successful reset');
  }, function(err) {
    ok(false, 'Should resolve successfully');
  });
});

test('failed password reset - rejects', function() {
  expect(1);
  stubRequest('/users/password', {}, { status: 400 });

  return session.resetPassword().then(function() {
    ok(false, 'Should have failed');
  }, function(err) {
    ok(true, 'Successfully failed');
  });
});

