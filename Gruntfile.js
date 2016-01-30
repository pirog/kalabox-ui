'use strict';

module.exports = function(grunt) {

  // loads all grunt-* tasks based on package.json definitions
  require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);

  /**
   * Load in our build configuration filez
   */
  var code = require('./grunt/code.js');
  var deps = require('./grunt/deps.js');
  var files = require('./grunt/files.js');
  var frontend = require('./grunt/frontend.js');
  var nw = require('./grunt/nw.js');
  var util = require('./grunt/util.js');

  /*
   * Helper funct to return some common build tasks
   */
  var commonBuildTasks = function() {
    return [
      //'test',
      'clean:build',
      'bower-install-simple:install',
      'html2js',
      'sass:build',
      'concat:buildCss',
      'copy:buildAppAssets',
      'copy:buildVendorAssets',
      'copy:buildAppJs',
      'copy:buildVendorJs',
      'copy:buildVendorCss',
      'index:build'
    ];
  };

  /*
   * Helper funct to add tasks to build and package based on options
   * @todo: we dont want to download every time we build so some sort of
   * cache would be good?
   *
   * NOTE: Grunt does not currently support multi-boolean options so you will
   * need to epxlicitly set the value of the options to true|false
   *
   * Options:
   *  deps = [true|false]: Will download the platform specific install deps
   *  iso = [true|false]: Will download the VM iso image
   */
  var parseBuildOptions = function(task) {

    // Start with generic pre tasks
    if (grunt.option('deps') || grunt.option('iso')) {
      task.push('clean:deps');
    }

    // Add in download deps if needed
    if (grunt.option('deps')) {
      task.push('curl-dir:osx64Deps');
      task.push('curl-dir:win64Deps');
      task.push('curl-dir:linux64Deps');
    }

    // Add in download iso if needed
    if (grunt.option('iso')) {
      task.push('curl-dir:iso');
    }

    // Return the task back
    return task;

  };

  /**
   * A utility function to get all app JavaScript sources.
   */
  function filterForJS (files) {
    return files.filter(function(file) {
      return file.match(/\.js$/);
    });
  }

  /**
   * A utility function to get all app CSS sources.
   */
  function filterForCSS (files) {
    return files.filter(function(file) {
      return file.match(/\.css$/);
    });
  }

  /**
   * This is the configuration object Grunt uses to give each plugin its
   * instructions.
   */
  var taskConfig = {

    // Let's use our pkg info here
    pkg: grunt.file.readJSON('./package.json'),

    /**
     * The banner is the comment that is placed at the top of our compiled
     * source files. It is first processed as a Grunt template, where the `<%=`
     * pairs are evaluated based on this very configuration object.
     */
    meta: {
      banner:
        '/**\n' +
        ' * <%= pkg.name %> - v<%= pkg.version %>\n' +
        ' * Compiled: <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * <%= pkg.homepage %>\n' +
        ' *\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> ' +
        '<%= pkg.author %>\n' +
        ' * Licensed <%= pkg.licenses.type %> <<%= pkg.licenses.url %>>\n' +
        ' */\n'
    },

    // Task to bump versions
    bump: util.bump,

    // Cleans out various dirs
    clean: {
      build: frontend.clean.build,
      deps: deps.clean.deps,
      nw: nw.clean.nw
    },

    // Also download other dependencies we might need
    'curl-dir': {
      osx64Deps: deps.downloads.osx64Deps,
      win64Deps: deps.downloads.win64Deps,
      linux64Deps: deps.downloads.linux64Deps,
      iso: deps.downloads.iso
    },

    // Installs bower deps
    'bower-install-simple': {
      install: frontend.bower.install,
      ci: frontend.bower.console
    },
    // Copies relevant things from a to b
    copy: {
      buildAppAssets: frontend.copy.buildAppAssets,
      buildVendorAssets: frontend.copy.buildVendorAssets,
      buildAppJs: frontend.copy.buildAppJs,
      buildVendorJs: frontend.copy.buildVendorJs,
      buildVendorCss: frontend.copy.buildVendorCss,
      compileAssets: frontend.copy.compileAssets,
      deps: deps.copy.deps
    },
    // Concatenates multiple source files into a single file.
    concat: {
      buildCss: frontend.concat.buildCss,
      compileJs: frontend.concat.compileJs
    },
    //annotates the sources before minifying.
    ngAnnotate: {
      compile: frontend.ngAnnotate.compile
    },
    // Sassify
    sass: {
      build: frontend.sass.build,
      compile: frontend.sass.compile
    },
    // Html2JS4Eva
    html2js: {
      app: frontend.html2js.app,
      common: frontend.html2js.common
    },
    // The `index` task compiles the `index.html` file as a Grunt template.r.
    index: {
      build: frontend.index.build,
      compile: frontend.index.compile
    },

    // Jslinting
    jshint: code.jshint,
    // Some code standards
    jscs: code.jscs,
    // Angular html validate
    htmlangular: code.htmlangular,
    // Compress built NW assets
    compress: nw.compress,
    // Build the NW binaries
    nwjs: nw.nwjs,
    // Run Some NW shell things
    shell: {
      nw: nw.shell.nw,
      build: nw.shell.build
    }
  };

  // Init our grunt config
  grunt.initConfig(grunt.util._.extend(taskConfig, files));

  /**
   * The default task is to build and compile.
   */
  grunt.registerTask('default', ['build']);
  grunt.registerTask('sassBuild', ['sass:build']);

  /**
   * The `code` task runs basic code linting and styling things
   */
  grunt.registerTask('test', [
    'jshint',
    'jscs',
    'htmlangular'
  ]);

  /**
   * The `build` task gets your app ready to run for development and testing.
   */
  // Start by grabbing our common build options
  var buildTask = commonBuildTasks();
  // Now parse our build opts
  buildTask = parseBuildOptions(buildTask);
  // Copy any deps over
  buildTask.push('copy:deps');
  // Add the NW run task
  buildTask.push('shell:nw');
  // Finally, register the build
  grunt.registerTask('build', buildTask);

  /**
   * The `pkg` task gets your app ready for deployment by concatenating and
   * minifying your code.
   */
  // Start with our common build tasks
  var pkgTask = commonBuildTasks();
  // Now parse our build opts
  pkgTask = parseBuildOptions(pkgTask);
  // Copy any deps over
  pkgTask.push('copy:deps');
  // Clean out our NW dirs before we build
  pkgTask.push('clean:nw');
  // Add NW build to finish it off
  pkgTask.push('shell:build');
  pkgTask.push('nwjs');
  //pkgTask.push('compress');
  // Finanly, register the packaging task
  grunt.registerTask('pkg', pkgTask);

  /**
   * The index.html template includes the stylesheet and javascript sources
   * based on dynamic names calculated in this Gruntfile. This task assembles
   * the list into variables for the template to use and then runs the
   * compilation.
   */
  grunt.registerMultiTask('index', 'Process index.html template', function() {
    var buildDir = grunt.config('buildDir');
    var compileDir = grunt.config('compileDir');
    var dirRE = new RegExp('^(' + buildDir + '|' + compileDir + ')\/', 'g');
    var jsFiles = filterForJS(this.filesSrc).map(function(file) {
      return file.replace(dirRE, '');
    });
    var cssFiles = filterForCSS(this.filesSrc).map(function(file) {
      return file.replace(dirRE, '');
    });

    grunt.file.copy('src/index.html', this.data.dir + '/index.html', {
      process: function(contents) {
        return grunt.template.process(contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles,
            version: grunt.config('pkg.version')
          }
        });
      }
    });
  });

};
