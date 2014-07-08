/* globals match, ENV: true, localStorage, facebookConnectPlugin: true */

import simpleModule from '../helpers/simple-module';
import stubRequest from '../helpers/stub-request';
import { test } from 'ember-qunit';

var properties = {
  access_token: "1234",
  email: "example@example.com"
};

var session;
simpleModule('Initializers/CordovaAuth/Initialize with Data', function(app, _session){
  session = _session;
  localStorage.setItem(session.localStorageKey(), JSON.stringify(properties));
  session.initializeState();
}, function() {
  session.reset();
});

test('sets properties after initialize', function() {
  expect(1);

  equal(session.get('email'), properties.email);
});

test('sets prefiler after initialize', function() {
  expect(1);
  var setPrefilter = false;
  session.setPrefilter = function() { setPrefilter = true; };
  session.initializeState();

  ok(setPrefilter, 'Prefilter was called');
});

test('sets isSignedIn', function() {
  expect(1);
  ok(session.get('isSignedIn'), 'Should be signed in');
});

simpleModule('Initializers/CordovaAuth/Initialize without Data', function(app, _session){
  session = _session;
  localStorage.removeItem(session.localStorageKey());
  session.initializeState();
}, function() {
  session.reset();
});

test('doesn\'t set prefiler', function() {
  expect(1);
  var setPrefilter = false;
  session.setPrefilter = function() { setPrefilter = true; };
  session.initializeState();

  ok(!setPrefilter, 'Prefilter wasnt called');
});

test('doesn\'t sets isSignedIn', function() {
  expect(1);
  ok(!session.get('isSignedIn'), 'Should not be signed in');
});
