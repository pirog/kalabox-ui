'use strict';

module.exports = function(grunt) {
  // commenting this out for now until used
  //var dist = '' + (process.env.SERVER_BASE || 'dist_dev');

  var path = require('path');
  var pconfig = require('./src/lib/pconfig');

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
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        updateConfigs: [],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json', 'bower.json'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false
      }
    },
    compress: {
      win: {
        options: {
          archive: 'built/kalabox-win-dev.zip'
        },
        files: [
          {
            expand: true,
            cwd: 'dist/Kalabox/win/',
            src: ['**'],
            dest: 'Kalabox/'
          }
        ]
      },
      osx: {
        options: {
          archive: 'built/kalabox-osx-dev.tar.gz',
          mode: 'tgz'
        },
        files: [
          {
            expand: true,
            cwd: 'dist/Kalabox/osx/',
            src: ['**'],
            dest: 'Kalabox/'
          }
        ]
      },
      linux32: {
        options: {
          archive: 'built/kalabox-linux32-dev.tar.gz',
          mode: 'tgz'
        },
        files: [
          {
            expand: true,
            cwd: 'dist/Kalabox/linux32/',
            src: ['**'],
            dest: 'Kalabox/'
          }
        ]
      },
      linux64: {
        options: {
          archive: 'built/kalabox-linux64-dev.tar.gz',
          mode: 'tgz'
        },
        files: [
          {
            expand: true,
            cwd: 'dist/Kalabox/linux64/',
            src: ['**'],
            dest: 'Kalabox/'
          }
        ]
      }
    },
    shell: {
      nw: {
        command: pconfig.devBinary + ' .'
      },
      build: {
        command: 'cd ./generated && npm install --production --ignore-scripts'
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
    protractor: {
      options: {
        configFile: 'test/protractor.conf.js',
        args: {
          chromeDriver: 'test/support/chromedriver',
          chromeOnly: true,
          baseUrl: 'file://' + path.resolve('src/index.html') + '#',
          rootElement: 'body'
        }
      },
      default: {
        specs: [
          'test/e2e/**/*.spec.js',
          'src/modules/*/test/e2e/**/*.spec.js'
        ]
      }
    },
    /**
     * Simple server for testing and dev.
     */
    connect: {
      options: {
        base: 'src'
      },
      serve: {},
      keepAlive: {
        options: {
          keepalive: true
        }
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
      workspaces: ['built', 'dist', 'generated', 'src/downloads']
    },
    nodewebkit: {
      options: {
        // Versions listed here: http://dl.node-webkit.org/
        version: 'v0.10.2',
        platforms: ['win', 'osx', 'linux32', 'linux64'],
        buildDir: 'dist'
      },
      src: ['generated/**/**']
    },
    /**
     * Karma unit test runner.
     */
    karma: {
      options: {
        configFile: 'test/karma.conf.js'
      },
      // Required by grunt, can override later.
      unit: {
        options: {
          singleRun: true,
          browsers: ['NodeWebkit']
        }
      }
    },
    /**
     * Basic bower task that uses
     * Bower's API's directly.
     */
    'bower-install-simple' : {
      install: {},
      ci: {
        options: {
          interactive: false
        }
      }
    }
  };

  // initialize task config
  grunt.initConfig(config);

  // load local tasks
  if (grunt.file.exists('tasks')) {
    grunt.loadTasks('tasks');
  }

  // loads all grunt-* tasks based on package.json definitions
  require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);

  // create workflows
  grunt.registerTask('default', [
    'bower-install-simple:install',
    'jshint',
    'less:dev',
    'shell:nw'
  ]);

  grunt.registerTask('test', [
    'jshint',
    'jscs',
    'bower-install-simple:ci',
    'test:unit',
    'test:e2e'
  ]);

  grunt.registerTask('test:js', [
    'jshint',
    'jscs',
  ]);

  grunt.registerTask('test:unit', [
    'karma:unit'
  ]);

  grunt.registerTask('test:e2e', [
    'protractor-setup',
    'protractor:default'
  ]);

  grunt.registerTask('build', [
    'clean',
    'bower-install-simple:install',
    'test',
    'less:dist',
    'copy',
    'shell:build',
    'nodewebkit',
    'compress:win',
    'compress:osx',
    'compress:linux32',
    'compress:linux64'
  ]);

  grunt.registerTask('version', [
    'bump-only:patch',
  ]);

  grunt.registerTask('release', [
    'bump-only:minor',
    'bump-commit'
  ]);

};
