var fs = require('fs');
var path = require('path');

function CordovaAuth(project) {
  this.project = project;
  this.name = 'Ember CLI Cordova Auth';
}

function unwatchedTree(dir) {
  return {
    read:    function() { return dir; },
    cleanup: function() { }
  };
}

CordovaAuth.prototype.treeFor = function included(name) {
  var treePath = path.join(__dirname, name + '-addon');

  if (fs.existsSync(treePath)) {
    return unwatchedTree(treePath);
  }
};

module.exports = CordovaAuth;
