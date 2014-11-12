'use strict';

/**
Dependencies
*/

var Filter = require('broccoli-filter');
var Writer = require('broccoli-writer');
var path = require('path');
var fs = require('fs');
var RSVP = require('rsvp');
var mkdirp = require('mkdirp');
// var Funnel = require('broccoli-funnel');
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

  console.log('processString');

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

  console

  post = JSON.stringify(post);

  return "import Em from 'ember';\nexport default " + post;
}

/**
Create
*/

function CreatePostsFixtures(inputTree, options) {
  if (!(this instanceof CreatePostsFixtures)) {
    return new CreatePostsFixtures(inputTree, options);
  }

  // Filter.call(this, inputTree, options); // this._super()

  // console.log(inputTree);

  console.log('cpf');

  this.inputTree = inputTree;
  this.options = options || {};
}

CreatePostsFixtures.prototype = Object.create(Writer.prototype);
CreatePostsFixtures.prototype.constructor = CreatePostsFixtures;
CreatePostsFixtures.prototype.extensions = ['md'];
CreatePostsFixtures.prototype.targetExtension = 'js';

CreatePostsFixtures.prototype.write = function(readTree, destDir) {
  var _this = this;

  return readTree(this.inputTree).then(function(srcDir) {
    // return new RSVP.Promise(function(resolve, reject) {
      var filePaths = walkSync(srcDir);
      // var markdownFiles = new Funnel('_this.inputTree, '{
      //   exclude: [new RegExp(/posts/)],
      //   destDir: destDir
      // });

      // console.log(markdownFiles);

      filePaths.forEach(function(filePath) {
        var srcFilePath  = path.join(srcDir, filePath);
        var destFilePath  = path.join(destDir, filePath);

        var isDirectory = srcFilePath.slice(-1) === '/';
        var isNotMarkdown = srcFilePath.indexOf('.md') === -1;
        var content;

        if (isDirectory) {
          mkdirp.sync(destFilePath);
          return;
        }

        content = fs.readFileSync(srcFilePath, { encoding: 'utf8' });

        if (isNotMarkdown) {
          fs.writeFileSync(destFilePath, content, 'utf8');
          return;
        }

        // console.log(destFilePath);
        content = parsePost(content);
        console.log(content);
        fs.writeFileSync(destFilePath.replace('.md','.js'), content, 'utf8');
      // });

      // resolve();
    });

    // var promise = new RSVP.Promise(function(resolve, reject) {
    //   someAsyncFunc(function(error, asyncData) {
    //     if (error) {
    //       rejectPromise(err);
    //     } else {
    //       resolvePromise(asyncData);
    //     }
    //   });
    // });

    // return promise;
    // console.log(getFiles(srcDir));
  });
}

CreatePostsFixtures.prototype.processFile = function (srcDir, destDir, relativePath) {
  console.log('farts');
}

module.exports = CreatePostsFixtures;
