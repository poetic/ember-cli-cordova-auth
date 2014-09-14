# ember-cli-cordova-auth [![Build Status](https://travis-ci.org/poetic/ember-cli-cordova-auth.svg?branch=master)](https://travis-ci.org/poetic/ember-cli-cordova-auth)

A simple authentication library built for ember-cli-cordova apps. It manages
whether or not the user is signed in by an authentication token.

It also supports Facebook login through [phonegap-facebook-plugin](https://github.com/phonegap/phonegap-facebook-plugin)

# Usage

This plugin provides a very simple API and injects a `session` object throughout
your app. Here are some of the methods available to you:

## Session Methods

* `config.` is being used to signify options in the config/environment.js file
* There is an implied this.session for accessing the methods


### **signIn / signUp - params: object**

Sends a POST request to config.signInUrl/signUpUrl respectively with object
passed in. The returned data get's set as properties on the session itself. It must
have a user root key in the response

Example response:

```js
//
{
  "user": {
    "id": 1,
    "authToken": "abc1234"
  }
}

// Then this would be what the session has on it

session.get('id') // 1
session.get('authToken') // "abc1234"
```

The returned data is persisted in localStorage using the
config.sessionLocalStorageKey key. On app initialization this is loaded back
into the session object automatically.

### **resetPassword - params: object**

Sends a POST request to config.resetPasswordUrl with object passed in. That's
it.

### **signInWithFacebook - params: array of fb permissions**
 
*Requires the
[phonegap-facebook-connect](https://github.com/Wizcorp/phonegap-facebook-plugin)
plugin to be installed. You must also be running the app within the simulator or
on a device*

Prompts the user with the Native Facebook dialog. When accepted it sends a
POST request to config.facebookSignInUrl with facebook's returned data.
Returned data from there get's set as properties on the session itself as it
does when calling signIn directly.

### **reset**

It clears the in memory session and the localStorage cached copy. 

## Config

The config is set in config/environment.js

```js
signInUrl
signUpUrl
facebookSignInUrl
resetPasswordUrl

/*
 * Optional: The key used to determine if a user is signed in or not
 */
authTokenKey

/*
 * Optional: The key used to store the session data in localStorage
 */
localStorageKey
```

## Properties

The session contains some default properties to validate session state as well
as the ones applied after signing up or in

### **isSignedIn**

At any point you can call `isSignedIn` to check whether or not a user is logged
in to the app. This is persisted across app restarts via localStorage.

example:

```js
import Ember from 'ember';
export default Ember.Route.extend({
  redirect: function() {
    if(!this.session.get('isSignedIn')) {
      this.transitionTo('sign-in');
    }
  }
});
```


### Developing this addon

Tests are done within the tests-app folder. If you add something new please add
tests that cover it.

```
git clone https://github.com/poetic/ember-cli-cordova-auth.git
cd ember-cli-cordova-auth
npm install && bower install
ember test
```


