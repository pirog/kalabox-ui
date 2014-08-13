'use strict';

module.exports = function(grunt) {
  // commenting this out for now until used
  //var dist = '' + (process.env.SERVER_BASE || 'dist_dev');
  var config = {
    pkg: grunt.file.readJSON('package.json'),
    files: {
      html: {
        src: 'src/index.html'
      },
      js: {
        src: [
          'src/modules/*/*.js',
          'src/app.js'
        ]
      },
      templates: {
        src: 'src/**/*.html'
      },
      less: {
        src: [
          'src/css/style.less'
        ]
      }
    },

    bower: {
      install: {
        options: {
          targetDir: './src/lib/vendor'
        }
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: ['Gruntfile.js', '<%= files.js.src %>']
    },
    jscs: {
      src: ['Gruntfile.js', '<%= files.js.src %>'],
      options: {
        config: '.jscsrc'
      }
    },
    less: {
      options: {
        paths: ['src/css'],
        ieCompat: false
      },
      dev: {
        src: '<%= files.less.src %>',
        dest: 'src/css/style.css'
      },
      dist: {
        options: {
          cleancss: true,
          compress: true
        },
        src: '<%= files.less.src %>',
        dest: 'src/css/style.css'
      }
    },
    watch: {
      options: {
        livereload: false
      },
      less: {
        files: ['<%= files.less.src %>'],
        tasks: ['less:dev']
      }
    },
    copy: {
      main: {
        files: [
          {
            expand: true,
            src: ['src/**'],
            dest: 'generated/'
          },
          {src: ['package.json'], dest: 'generated/package.json'}
        ]
      }
    },
    clean: {
      workspaces: ['dist', 'generated', 'src/downloads']
    },
    nodewebkit: {
      options: {
        // Versions listed here: http://dl.node-webkit.org/
        version: 'v0.10.1',
        platforms: ['win', 'osx', 'linux32', 'linux64'],
        buildDir: 'dist'
      },
      src: ['generated/**/**']
    }
  };

  // initialize task config
  grunt.initConfig(config);

  // load local tasks
  // Comment this out until we actually have local tasks
  // grunt.loadTasks('tasks');

  // loads all grunt-* tasks based on package.json definitions
  require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);

  // create workflows
  grunt.registerTask('default', [
    'bower',
    'jshint',
    'less:dev',
    'watch'
  ]);

  grunt.registerTask('test', [
    'jshint',
    'jscs'
  ]);

  grunt.registerTask('build', [
    'clean',
    'bower',
    'jshint',
    'less:dist',
    'copy',
    'nodewebkit'
  ]);
};
