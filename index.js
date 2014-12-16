var chalk = require('chalk');
var fixturesCreator = require('./lib/fixtures-creator');
var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: 'octosmashed-fixtures-ember-cli', // TODO - change name
  enabled: true,
  fileOptions: { encoding: 'utf8' },
  // postsDirectory: 'posts',
  fixturesPath: 'posts-fixtures',
  templatesDirectory: null,

  /* Override default options with those defined by the developer */

  setOptions: function() {
    var options = this.app.options.octosmashedFixtures || {};
    this.templatesDirectory = '/' + this.app.name + '/templates';

    for (var option in options) {
      this[option] = options[option];
    }
  },

  included: function(app) {
    var _this = this;
    var fixturesOptions = {};

    this.app = app;
    this.setOptions();

    [
      'fileOptions',
      'fixturesPath',
      'templatesDirectory'
    ].forEach(function(option) {
      fixturesOptions[option] = _this[option];
    });

    if (this.enabled) {
      app.registry.add('js', {
        name: 'octosmashed-posts-templates',
        ext: 'md',

        /* https://github.com/stefanpenner/ember-cli/blob/master/lib/preprocessors/javascript-plugin.js */

        toTree: function(tree) {
          var posts = new Funnel(tree, {
            include: [new RegExp(/\/posts\/.*.md$/)]
            // srcDir: postsDir,
            // include: [new RegExp(/^.*\.(md|hbs)$/)]
          });
          var fixturesTree = fixturesCreator(posts, fixturesOptions);

          return mergeTrees([tree, fixturesTree], {
            overwrite: true
          });
        }
      });
    } else {
      warn(this.name + ' is not enabled.');
    }

  },
}

/* Helper methods */

var warn = function(message) {
  console.log(chalk.yellow('Warning: ' + message));
}
