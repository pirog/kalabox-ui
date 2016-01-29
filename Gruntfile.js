'use strict';

module.exports = function(grunt) {

  // loads all grunt-* tasks based on package.json definitions
  require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);

  var pconfig = require('./src/lib/pconfig');

  /**
   * Load in our build configuration file.
   */
  var userConfig = require('./build.config.js');

  /**
   * This is the configuration object Grunt uses to give each plugin its
   * instructions.
   */
  var taskConfig = {
    /**
     * We read in our `package.json` file so we can access the package name and
     * version. It's already there, so we don't repeat ourselves here.
     */
    pkg: grunt.file.readJSON('package.json'),

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
    },

    /**
     * Creates a changelog on a new version.
     */
    changelog: {
      options: {
        dest: 'CHANGELOG.md',
        template: 'changelog.tpl'
      }
    },

    /**
     * Increments the version number, etc.
     */
    bump: {
      options: {
        files: [
          'package.json',
          'bower.json'
        ],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: [
          'package.json',
          'client/bower.json'
        ],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'origin'
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
    /**
     * The directories to delete when `grunt clean` is executed.
     */
    clean: [
      '<%= buildDir %>',
      '<%= compileDir %>'
    ],

    /**
     * The `copy` task just copies files from A to B. We use it here to copy
     * our project assets (images, fonts, etc.) and javascripts into
     * `build_dir`, and then to copy the assets to `compile_dir`.
     */
    copy: {
      buildAppAssets: {
        files: [
          {
            src: ['**'],
            dest: '<%= buildDir %>/images/',
            cwd: 'src/images',
            expand: true
          },
          {src: ['package.json'], dest: '<%= buildDir %>/package.json'}
       ]
      },
      buildVendorAssets: {
        files: [
          {
            src: ['<%= vendorFiles.assets %>'],
            dest: '<%= buildDir %>/',
            cwd: '.',
            expand: true
          }
       ]
      },
      buildAppjs: {
        files: [
          {
            src: ['<%= appFiles.js %>'],
            dest: '<%= buildDir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      buildVendorjs: {
        files: [
          {
            src: ['<%= vendorFiles.js %>'],
            dest: '<%= buildDir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      buildVendorcss: {
        files: [
          {
            src: ['<%= vendorFiles.css %>'],
            dest: '<%= buildDir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      compileAssets: {
        files: [
          {
            src: ['**'],
            dest: '<%= compileDir %>',
            cwd: '<%= buildDir %>/assets',
            expand: true
          },
          {
            src: ['<%= vendorFiles.css %>'],
            dest: '<%= compileDir %>/',
            cwd: '.',
            expand: true
          }
        ]
      }
    },

    /**
     * `grunt concat` concatenates multiple source files into a single file.
     */
    concat: {
      /**
       * The `build_css` target concatenates compiled CSS and vendor CSS
       * together.
       */
      buildCss: {
        src: [
          '<%= vendorFiles.css %>',
          '<%= buildDir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        ],
        dest: '<%= buildDir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
      },
      /**
       * The `compile_js` target is the concatenation of our application source
       * code and all specified vendor source code into a single file.
       */
      compileJs: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          '<%= vendorFiles.js %>',
          //'module.prefix',
          '<%= buildDir %>/src/modules/**/*.js',
          '<%= html2js.app.dest %>',
          'module.suffix'
        ],
        dest: '<%= compileDir %>/<%= pkg.name %>-<%= pkg.version %>.js'
      }
    },

    /**
     * `ngAnnotate` annotates the sources before minifying. That is, it allows us
     * to code without the array syntax.
     */
    ngAnnotate: {
      compile: {
        files: [
          {
            src: ['<%= appFiles.js %>'],
            cwd: '<%= buildDir %>',
            dest: '<%= buildDir %>',
            expand: true
          }
        ]
      }
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
        buildDir: '<%= compileDir %>',
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
        buildDir: '<%= compileDir %>'
      },
      src: ['<%= buildDir %>/**/**']
    },

    /**
     * Minify the sources!
     */
    uglify: {
      compile: {
        options: {
          banner: '<%= meta.banner %>'
        },
        files: {
          '<%= concat.compileJs.dest %>': '<%= concat.compileJs.dest %>'
        }
      }
    },

    /**
     * `grunt-contrib-sass` handles our LESS compilation and uglification automatically.
     * Only our `main.scss` file is included in compilation; all other files
     * must be imported from this file.
     */
    sass: {
      build: {
        files: {
          '<%= buildDir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css':
            '<%= appFiles.sass %>'
        }
      },
      compile: {
        files: {
          '<%= buildDir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css':
            '<%= appFiles.sass %>'
        },
        options: {
          cleancss: true,
          compress: true
        }
      }
    },

    /**
     * `jshint` defines the rules of our linter as well as which files we
     * should check. This file, all javascript sources, and all our unit tests
     * are linted based on the policies listed in `options`. But we can also
     * specify exclusionary patterns by prefixing them with an exclamation
     * point (!); this is useful when code comes from a third party but is
     * nonetheless inside `src/`.
     */
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      src: [
        '<%= appFiles.js %>',
      ],
      test: [
        '<%= appFiles.jsunit %>'
      ],
      config: [
        'build.config.js'
      ],
      gruntfile: [
        'Gruntfile.js'
      ]
    },

    // Some code standards
    jscs: {
      options: {
        config: '.jscsrc'
      },
      src: [
        '<%= appFiles.js %>',
      ],
      test: [
        '<%= appFiles.jsunit %>'
      ],
      config: [
        'build.config.js'
      ],
      gruntfile: [
        'Gruntfile.js'
      ]
    },

    // Angular html validate
    htmlangular: {
      options: {
        tmplext: 'html.tmpl',
        customattrs: [
          'job-*',
          'site-*',
          'provider-*',
          'placeholder',
          'start-*'
        ],
        relaxerror: [
          'Empty heading.',
          'Element “img” is missing required attribute “src”'
        ]
      },
      files: {
        src: ['<%= appFiles.atpl %>']
      }
    },

    /**
     * HTML2JS is a Grunt plugin that takes all of your template files and
     * places them into JavaScript files as strings that are added to
     * AngularJS's template cache. This means that the templates too become
     * part of the initial payload as one JavaScript file. Neat!
     */
    html2js: {
      /**
       * These are the templates from `src/modules`.
       */
      app: {
        options: {
          base: 'src'
        },
        src: ['<%= appFiles.atpl %>'],
        dest: '<%= buildDir %>/templates-app.js'
      },

      /**
       * These are the templates from `src/common`.
       * @todo: do we need this? Doesn't seem so, disabled in compile.
       */
      common: {
        options: {
          base: 'src/common'
        },
        src: ['<%= appFiles.ctpl %>'],
        dest: '<%= buildDir %>/templates-common.js'
      }
    },

    /**
     * The `index` task compiles the `index.html` file as a Grunt template. CSS
     * and JS files co-exist here but they get split apart later.
     */
    index: {

      /**
       * During development, we don't want to have wait for compilation,
       * concatenation, minification, etc. So to avoid these steps, we simply
       * add all script files directly to the `<head>` of `index.html`. The
       * `src` property contains the list of included files.
       */
      build: {
        dir: '<%= buildDir %>',
        src: [
          '<%= vendorFiles.js %>',
          '<%= buildDir %>/src/modules/**/*.js',
          '<%= html2js.app.dest %>',
          '<%= vendorFiles.css %>',
          '<%= buildDir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        ]
      },

      /**
       * When it is time to have a completely compiled application, we can
       * alter the above to include only a single JavaScript and a single CSS
       * file. Now we're back!
       */
      compile: {
        dir: '<%= compileDir %>',
        src: [
          '<%= concat.compileJs.dest %>',
          '<%= vendorFiles.css %>',
          '<%= buildDir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        ]
      }
    },

    /**
     * And for rapid development, we have a watch set up that checks to see if
     * any of the files listed below change, and then to execute the listed
     * tasks when they do. This just saves us from having to type "grunt" into
     * the command-line every time we want to see what we're working on; we can
     * instead just leave "grunt watch" running in a background terminal. Set it
     * and forget it, as Ron Popeil used to tell us.
     *
     * But we don't need the same thing to happen for all the files.
     */
    delta: {
      /**
       * By default, we want the Live Reload to work for all tasks; this is
       * overridden in some tasks (like this file) where browser resources are
       * unaffected. It runs by default on port 35729, which your browser
       * plugin should auto-detect.
       */
      options: {
        livereload: true
      },

      /**
       * When the Gruntfile changes, we just want to lint it. In fact, when
       * your Gruntfile changes, it will automatically be reloaded!
       */
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: ['jshint:gruntfile'],
        options: {
          livereload: false
        }
      },

      /**
       * When assets are changed, copy them. Note that this will *not* copy new
       * files, so this is probably not very useful.
       */
      assets: {
        files: [
          'src/assets/**/*'
        ],
        tasks: ['copy:buildAppAssets', 'copy:buildVendorAssets']
      },

      /**
       * When index.html changes, we need to compile it.
       */
      html: {
        files: ['<%= appFiles.html %>'],
        tasks: ['index:build']
      },

      /**
       * When our templates change, we only rewrite the template cache.
       */
      tpls: {
        files: [
          '<%= appFiles.atpl %>',
          '<%= appFiles.ctpl %>'
        ],
        tasks: ['html2js']
      },

      /**
       * When the CSS files change, we need to compile and minify them.
       */
      sass: {
        files: ['src/**/*.scss'],
        tasks: ['sass:build']
      }
    },
    shell: {
      nw: {
        command: pconfig.devBinary + ' <%= buildDir %>',
        options: {
          execOptions: {
            maxBuffer: Infinity
          }
        }
      },
      build: {
        command: [
          'cd ./<%= compileDir %>',
          '&&',
          'npm install --production --ignore-scripts'
        ].join(' ')
      }
    },
  };

  grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

  /**
   * In order to make it safe to just compile or copy *only* what was changed,
   * we need to ensure we are starting from a clean, fresh build. So we rename
   * the `watch` task to `delta` (that's why the configuration var above is
   * `delta`) and then add a new task called `watch` that does a clean build
   * before watching for changes.
   */
  grunt.renameTask('watch', 'delta');
  grunt.registerTask('watch', ['build', 'delta']);

  /**
   * The default task is to build and compile.
   */
  grunt.registerTask('default', ['build']);

  /**
   * The `code` task runs basic code linting and styling things
   */
  grunt.registerTask('code', [
    'jshint',
    'jscs',
    'htmlangular'
  ]);

  /**
   * The `build` task gets your app ready to run for development and testing.
   */
  grunt.registerTask('build', [
    'clean',
    'bower-install-simple:install',
    'html2js',
    'jshint',
    'sass:build',
    'concat:buildCss',
    'copy:buildAppAssets',
    'copy:buildVendorAssets',
    'copy:buildAppjs',
    'copy:buildVendorJs',
    'copy:buildVendorCss',
    'index:build',
    'shell:nw'
  ]);

  /**
   * The `compile` task gets your app ready for deployment by concatenating and
   * minifying your code.
   */
  grunt.registerTask('compile', [
    'sass:compile',
    'copy:compileAssets',
    'ngAnnotate',
    'concat:compileJs',
    'uglify',
    'index:compile',
    'shell:build',
    'nwjs',
    'compress:win32',
    'compress:win64',
    'compress:osx32',
    'compress:osx64',
    'compress:linux32',
    'compress:linux64'
  ]);

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
