import Ember from 'ember';

var baseUrl = "http://localhost:3000/api/v1";

export default function(url, json, options) {
  if(options == null) {
    options = {};
  }

  options = Ember.merge({
      url: baseUrl + url,
      dataType: 'json',
      responseText: json
  }, options);

  Ember.$.mockjax(options);
  Ember.$.mockjaxSettings.logging = false;
  Ember.$.mockjaxSettings.responseTime = 0;
}

