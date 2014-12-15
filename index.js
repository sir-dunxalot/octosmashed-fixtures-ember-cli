var chalk = require('chalk');
var fixtureCreator = require('./lib/fixture-creator');
var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: 'octosmashed-fixtures-ember-cli', // TODO - change name
  enabled: true,
  fileOptions: { encoding: 'utf8' },
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
    var fixturesOptions = {};
    this.app = app;
    this.setOptions();

    fixturesOptions.fileOptions = this.fileOptions;
    fixturesOptions.fixturesPath = this.fixturesPath;
    fixturesOptions.templatesDirectory = this.templatesDirectory;


    if (this.enabled) {
      app.registry.add('js', {
        name: 'octosmashed-posts-templates',
        ext: 'md',
        toTree: function(tree) {
          var posts = new Funnel(tree, {
            // srcDir: 'dummy/posts'
            include: [new RegExp(/\/posts\/.*.md$/)] // .md
          });

          return mergeTrees([tree, fixtureCreator(posts, fixturesOptions)], {
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
