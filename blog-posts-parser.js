'use strict';

/* Dependencies */

var CachingWriter = require('broccoli-caching-writer');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var walkSync = require('walk-sync');
var compiler = require('ember-template-compiler');
var parsePost = require('./lib/parse-post');

/* Create */

function FixtureCreator(inputTree, options) {
  if (!(this instanceof FixtureCreator)) {
    return new FixtureCreator(inputTree, options);
  }

  CachingWriter.apply(this, arguments); // this._super();

  this.inputTree = inputTree;
  this.options = options;
}

FixtureCreator.prototype = Object.create(CachingWriter.prototype);
FixtureCreator.prototype.constructor = FixtureCreator;

FixtureCreator.prototype.updateCache = function(srcDir, destDir) {
  var _this = this;
  var filePaths = walkSync(srcDir);
  var fixturesDestPath  = path.join(destDir, this.options.fixturesPath); // TODO
  var fileOptions = this.options.fileOptions; // TODO
  var templatesDir = path.join(destDir, this.options.templatesDirectory);
  var fixtures = [];

  if (!filePaths.length) {
    return;
  }

  if (!fs.exists(templatesDir)) {
    mkdirp.sync(templatesDir);
  }

  // Need categories

  filePaths.forEach(function(filePath) {
    var srcPath  = path.join(srcDir[0], filePath);
    var isDirectory = srcPath.slice(-1) === '/';
    var pathThatIsDir, post, template;

    if (isDirectory) {
      pathThatIsDir = path.join(destDir, filePath);

      if (!fs.exists(pathThatIsDir)) {
        mkdirp.sync(pathThatIsDir);
      }
    } else {
      post = fs.readFileSync(srcPath, fileOptions);
      post = parsePost(post);

      template = compiler.precompile(post['body']);
      template = "Ember.Handlebars.template(" + template + ");\n";
      template = "import Ember from 'ember';\nexport default " + template;

      fs.writeFileSync(templatesDir + '/' + post['urlString'], template, fileOptions);

      fixtures.push('\n' + JSON.stringify(post));
    }
  });

  // REMOVE FILES

  fixtures = 'export default [' + fixtures + '];';
  fs.writeFileSync(fixturesDestPath, fixtures, fileOptions); // Write fixtures
}

module.exports = BlogPostsParser;
