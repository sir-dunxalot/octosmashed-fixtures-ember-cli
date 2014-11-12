octosmashed-fixtures-brunch
=============================

This is a Brunch plugin built specifically for [Octosmashed](https://github.com/sir-dunxalot/ember-blog), an Ember.js/Brunch static blogging framework. It is a port of the [yaml-front-matter-brunch](https://github.com/sir-dunxalot/yaml-front-matter-brunch) Brunch plugin.

It is very unlikely you will use this module outside of Octosmashed but, if you do, here is some info on how it functions. For more info, see the [original module README](https://github.com/sir-dunxalot/yaml-front-matter-brunch/blob/master/README.md) and the [Octosmashed README](https://github.com/sir-dunxalot/ember-blog/blob/master/README.md).

How it works
------

This plugin watches markdown files and compiles them into a javascript module. The plugin parses your post with [marked](https://github.com/chjj/marked), highlights code blocks with [highlight.js](http://highlightjs.org/), and intelligently handles handlebars braces to allow Handlebars templates to be compiled in an Ember app whilst also allowing code blocks displaying handlebars to be highlighted and not parsed by the Ember/Handlebars app.

Thus, you can use Handlebars helpers like {{link-to}} in your markdown file and the file can be parsed as a Handlebars template, rendering the link within your Ember app. You can also write Handlebars in your markdown code blocks and they will not be parsed, just rendered as HTML entities on the page.
