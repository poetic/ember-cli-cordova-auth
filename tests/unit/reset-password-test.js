/* globals match, localStorage, facebookConnectPlugin: true */

import simpleModule from '../helpers/simple-module';
import stubRequest from '../helpers/stub-request';
import { test } from 'ember-qunit';
import config from '../../config/environment';

var session;
simpleModule('Initializers/CordovaAuth/ResetPassword', function(app, _session){
  session = _session;
}, function() {
  session.reset();
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

