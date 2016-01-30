'use strict';

/**
 * This file/module contains helpful frontend config.
 */

module.exports = {

  /**
   * Clean out the build dirs
   */
  clean: {
    build: [
      '<%= buildDir %>',
      '<%= compileDir %>'
    ]
  },

  /**
   * Basic bower task that uses
   * Bower's API's directly.
   */
  bower : {
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
    buildAppJs: {
      files: [
        {
          src: ['<%= appFiles.js %>'],
          dest: '<%= buildDir %>/',
          cwd: '.',
          expand: true
        }
      ]
    },
    buildVendorJs: {
      files: [
        {
          src: ['<%= vendorFiles.js %>'],
          dest: '<%= buildDir %>/',
          cwd: '.',
          expand: true
        }
      ]
    },
    buildVendorCss: {
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
  }

};
