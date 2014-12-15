var blogPostsParser = require('./blog-posts-parser');
// var concat = require('broccoli-concat');
var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');

module.exports = {
  // header: 'export default [',
  // footer: '];var FINDME;',
  name: 'octosmashed-fixtures-ember-cli', // Change name
  // outputPath: 'dummy/posts-fixtures',

  included: function(app) {
    this.app = app;

    app.registry.add('js', {
      name: 'octosmashed-posts-templates',
      ext: 'md',
      toTree: function(tree) {
        var posts = new Funnel(tree, {
          // srcDir: 'dummy/posts'
          include: [new RegExp(/\/posts\/.*.md$/)] // .md
        });

        return mergeTrees([tree, blogPostsParser(posts)], {
          overwrite: true
        });
        // return tree;
      }
    });

  },

  // postprocessTree: function(type, tree) {
  //   console.log(this.app.options.outputPaths);
  //   var treeWithFixtures = concat(tree, {
  //     allowNone: true,
  //     footer: this.footer,
  //     header: this.header,
  //     inputFiles: ['dummy/posts/leak-attack/2.js'],
  //     outputFile: '/' + this.outputPath + '.js',
  //     wrapInFunction: false
  //   });

  //   // Need to remove files

  //   return mergeTrees([tree, treeWithFixtures], {
  //     overwrite: true
  //   });
  // }
}
