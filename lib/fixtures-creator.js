'use strict';

/* Dependencies */

var CachingWriter = require('broccoli-caching-writer');
var compiler = require('ember-template-compiler');
var fs = require('fs');
var mkdirp = require('mkdirp');
var parsePost = require('./parse-post');
var path = require('path');
var walkSync = require('walk-sync');

/* Create */

function FixturesCreator(inputTree, options) {
  if (!(this instanceof FixturesCreator)) {
    return new FixturesCreator(inputTree, options);
  }

  CachingWriter.apply(this, arguments); // this._super();

  this.inputTree = inputTree;
  this.options = options;
}

FixturesCreator.prototype = Object.create(CachingWriter.prototype);
FixturesCreator.prototype.constructor = FixturesCreator;

FixturesCreator.prototype.updateCache = function(srcDir, destDir) {
  var _this = this;
  var options = _this.options;

  var filePaths = walkSync(srcDir);
  var fixturesDestPath  = path.join(destDir, options.fixturesPath + '.js');
  var fileOptions = options.fileOptions;
  var templatesDir = path.join(destDir, options.templatesDirectory);
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
    var dirPath, post, template;

    if (isDirectory) {
      dirPath = path.join(destDir, filePath);

       if (!fs.exists(dirPath)) {
        mkdirp.sync(dirPath);
      }
    } else {
      post = fs.readFileSync(srcPath, fileOptions);
      post = parsePost(post);

      template = compiler.precompile(post['body']);
      template = 'Em.Handlebars.template(' + template + ');\n'
      template = "import Em from 'ember';\nexport default " + template;

      fs.writeFileSync(templatesDir + '/' + post['urlString'] + '.js', template, fileOptions);

      fixtures.push('\n' + JSON.stringify(post));
    }
  });

  fixtures = 'export default [' + fixtures + '];';
  fs.writeFileSync(fixturesDestPath, fixtures, fileOptions); // Write fixtures
}

module.exports = FixturesCreator;
