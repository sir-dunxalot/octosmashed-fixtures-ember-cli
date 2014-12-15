'use strict';

/**
Dependencies
*/

// var Filter = require('broccoli-filter');
// var Writer = require('broccoli-writer');
var CachingWriter = require('broccoli-caching-writer');
var path = require('path');
var fs = require('fs');
// var Promise = require('rsvp').Promise;
// var mkdirp = require('mkdirp');
// var helpers = require('broccoli-kitchen-sink-helpers');
var walkSync = require('walk-sync');

var hljs = require('highlight.js');
var jsYaml = require('yaml-front-matter');
var marked = require('marked');
var currentPostId = 0;

/**
Helper functions
*/

var dasherize = function(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^-a-z \d]/ig, '');
}

var replaceApostrophes = function(text) {
  return text.replace(/&#39;/g,'\u0027');
}

var replaceHandlebars = function(text) {
  return text.replace(/{{/g, '&#123;&#123;').replace(/}}/g, '&#125;&#125;');
}

var parsePost = function(content) {
  var customRenderer = new marked.Renderer();
  var post = jsYaml.loadFront(content);

  // console.log('processString');

  marked.setOptions({

    // Block code
    highlight: function (code, lang) {

      if (lang) {
        code = hljs.highlight(lang, code).value;
      } else {
        code = hljs.highlightAuto(code).value;
      }

      return replaceHandlebars(code);
    },
  });

  // Inline code
  customRenderer.codespan = function(text, level) {
    var codeBlock = replaceHandlebars(text);

    return '<code>' + codeBlock + '</code>';
  }

  /**
  Parse post content as markdown
  */

  post['__content'] = marked(post['__content'], {
    renderer: customRenderer
  });

  /**
  Add categories and posts to fixtures
  */

  post['urlString'] = dasherize(post['title']);
  post['__content'] = replaceApostrophes(post['__content']);

  // Rename content
  post['content'] = post['__content'];
  delete post['__content'];

  post['id'] = currentPostId;
  currentPostId++;

  // console

  post = JSON.stringify(post);

  return post;
}

/**
Create
*/

function BlogPostsParser(inputTree, options) {
  if (!(this instanceof BlogPostsParser)) {
    return new BlogPostsParser(inputTree, options);
  }

  CachingWriter.apply(this, arguments); // this._super();

  this.inputTree = inputTree;
  this.options = options || {};
}

BlogPostsParser.prototype = Object.create(CachingWriter.prototype);
BlogPostsParser.prototype.constructor = BlogPostsParser;
BlogPostsParser.prototype.extensions = ['md'];
BlogPostsParser.prototype.targetExtension = 'js';

BlogPostsParser.prototype.updateCache = function(srcDir, destDir) {
  var _this = this;
  var filePaths = walkSync(srcDir);
  var destFilePath  = path.join(destDir + '/dummy/posts-fixtures.js');
  var fileOptions = { encoding: 'utf8' };
  var fixtures = [];

  // console.log(filePaths);

  filePaths.forEach(function(filePath) {
    var srcFilePath  = path.join(srcDir[0], filePath);
    var isDirectory = srcFilePath.slice(-1) === '/';
    var content;

    if (!isDirectory) {
      content = fs.readFileSync(srcFilePath, fileOptions);
      content = parsePost(content);

      fixtures.push('\n' + content);
    }
  });

  fixtures = 'export default [' + fixtures + '];var FINDME;';

  console.log(fixtures);

  fs.writeFileSync(destFilePath, fixtures, fileOptions);

}

module.exports = BlogPostsParser;
