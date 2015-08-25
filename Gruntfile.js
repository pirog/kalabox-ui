
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
      win32: {
        options: {
          archive: 'built/kalabox-win32-dev.zip'
        },
        files: [
          {
            expand: true,
            cwd: 'dist/Kalabox/win32/',
            src: ['**'],
            dest: 'Kalabox/'
          }
        ]
      },
      win64: {
        options: {
          archive: 'built/kalabox-win64-dev.zip'
        },
        files: [
          {
            expand: true,
            cwd: 'dist/Kalabox/win64/',
            src: ['**'],
            dest: 'Kalabox/'
          }
        ]
      },
      osx32: {
        options: {
          archive: 'built/kalabox-osx32-dev.tar.gz',
          mode: 'tgz'
        },
        files: [
          {
            expand: true,
            cwd: 'dist/Kalabox/osx32/',
            src: ['**'],
            dest: 'Kalabox/'
          }
        ]
      },
      osx64: {
        options: {
          archive: 'built/kalabox-osx64-dev.tar.gz',
          mode: 'tgz'
        },
        files: [
          {
            expand: true,
            cwd: 'dist/Kalabox/osx64/',
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
        command: pconfig.devBinary + ' generated/',
        options: {
          execOptions: {
            maxBuffer: Infinity
          }
        }
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
          {
            expand: true,
            src: ['config/**'],
            dest: 'generated/'
          },
          {src: ['package.json'], dest: 'generated/package.json'}
        ]
      }
    },
    clean: {
      workspaces: ['built', 'dist', 'generated', 'src/downloads']
    },
    nwjs: {
      options: {
        platforms: [
          'win32',
          'win64',
          'osx32',
          'osx64',
          'linux32',
          'linux64'
        ],
        buildDir: 'dist'
      },
    },
    nodewebkit: {
      options: {
        // Versions listed here: http://dl.node-webkit.org/
        version: 'v0.11.6',
        platforms: [
          'win32',
          'win64',
          'osx32',
          'osx64',
          'linux32',
          'linux64'
        ],
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
      install: {
        options: {
          directory: 'src/lib/vendor'
        },
      },
      ci: {
        options: {
          directory: 'src/lib/vendor',
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
    'clean',
    'bower-install-simple:install',
    'jshint',
    'less:dev',
    'copy',
    'shell:nw'
  ]);

  grunt.registerTask('test', [
    'jshint',
    'jscs',
    'bower-install-simple:ci',
    'test:unit'/*,
    'test:e2e'*/
  ]);

  grunt.registerTask('test:js', [
    'jshint',
    'jscs',
  ]);

  grunt.registerTask('test:unit', [
    //'karma:unit'
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
    'nwjs',
    'compress:win32',
    'compress:win64',
    'compress:osx32',
    'compress:osx64',
    'compress:linux32',
    'compress:linux64'
  ]);

  grunt.registerTask('bump-patch', [
    'bump-only:patch'
  ]);

  grunt.registerTask('bump-minor', [
    'bump-only:minor',
    'bump-commit'
  ]);

};
