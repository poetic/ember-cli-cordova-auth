# ember-cli-cordova-auth [![Build Status](https://travis-ci.org/poetic/ember-cli-cordova-auth.svg?branch=master)](https://travis-ci.org/poetic/ember-cli-cordova-auth)

A simple authentication library built for ember-cli-cordova apps. It manages
whether or not the user is signed in by an authentication token.

# Installation

```sh
npm install --save-dev ember-cli-cordova-auth
```

# Usage

This plugin provides a very simple API and injects a `session` object throughout
your app. Here are some of the methods available:

## Third party authentication support

Facebook - [phonegap-facebook-plugin](https://github.com/phonegap/phonegap-facebook-plugin)
Google - [cordova-plugin-googleplus](https://github.com/poetic/cordova-plugin-googleplus)

## Session Methods

* `config.` is being used to signify options in the config/environment.js file
* There is an implied this.session for accessing the methods
* All methods return promises

### signIn / signUp - params: object

Sends a POST request to config.signInUrl/signUpUrl respectively with object
passed in. The returned data get's set as properties on the session itself. It must
have a user root key in the response

Example response:

```js
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

### resetPassword - params: object

Sends a POST request to config.resetPasswordUrl with object passed in. That's
it.

### signInWithFacebook - params: array of fb permissions

*Requires the
[phonegap-facebook-connect](https://github.com/Wizcorp/phonegap-facebook-plugin)
plugin to be installed. You must also be running the app within the simulator or
on a device*

Prompts the user with the Native Facebook dialog. When accepted it sends a
POST request to config.facebookSignInUrl with facebook's returned data.
Returned data from there get's set as properties on the session itself as it
does when calling signIn directly.

### signInWithGoogle - params: Object with at least the iOSApiKey and value

*Requires the
[cordova-plugin-googleplus](https://github.com/EddyVerbruggen/cordova-plugin-googleplus)
plugin to be installed. You must also be running the app within the simulator or
on a device*

It takes the user to the device browser so you can authenticate with google.
When it returns to the app after a successful response, it makes a POST request
to config.googleSignInUrl with the returned data. The response of this POST
should be the same as when calling signIn directly, thus getting stored on the
session (user data).

### signOut

It clears the in memory session and the localStorage cached copy.

## Config

The config is set in config/environment.js

```
  // These URL's are used when sending external requests

  ENV.signInUrl               = 'http://localhost:3000/api/v1/sessions';
  ENV.signUpUrl               = 'http://localhost:3000/api/v1/sign_up';
  ENV.facebookSignInUrl       = 'http://localhost:3000/api/v1/sessions/facebook';
  ENV.resetPasswordUrl        = 'http://localhost:3000/api/v1/users/password';

  // A computed property is set on an 'authToken' value being present in the signIn/signUp response. This determines
  // if a user is signed in or not. Use this setting to override it if needed

  ENV.authTokenKey  = 'access_token';

  // The session is persisted to localstorage under an 'ember-cli-cordova-auth' key by default. You can override it
  // with this option

  ENV.sessionLocalStorageKey  = 'test-localstorage';
```

## Properties

The session contains some default properties to validate session state as well
as the ones applied after signing up or in

### isSignedIn

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

### Others

The properties returned from calling signIn / signUp will also be store. See the section on those methods for details.


### Developing this addon

Tests are done within the tests-app folder. If you add something new please add
tests that cover it.

```
git clone https://github.com/poetic/ember-cli-cordova-auth.git
cd ember-cli-cordova-auth
npm install && bower install
ember test
```


