import resolver from './helpers/resolver';
import { setResolver } from 'ember-qunit';

setResolver(resolver);

document.write('<div id="ember-testing-container"><div id="ember-testing"></div></div>');

window.match = function(str1, str2) {
  return ok((new RegExp(str1, 'i')).test(str2));
};
