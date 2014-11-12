var createPostsFixtures = require('./create-posts-fixtures');

module.exports = {
  name: 'octosmashed-fixtures-ember-cli',

  included: function(app) {
    this.app = app;
    this._super.included(app);

    app.registry.add('js', {
      name: 'octosmashed-fixtures',
      ext: 'md',
      toTree: function(tree) {
        return createPostsFixtures(tree, {
          extension: this.ext
        });
      }
    });

    // app.registry.add('template', {
    //   name: 'octosmashed-posts-templates',
    //   ext: 'md',
    //   toTree: function(tree) {
    //     return postParser(tree);
    //   }
    // });

  }
}
