'use strict';

/**
 * This file/module contains helpful download config.
 */

module.exports = {

  /*
   * Download admin deps to package with GUI
   * @todo: grab these directly from kalabox
   */
  // jscs:disable
  downloads: {
    osx64Deps: {
      src: [
        'http://download.virtualbox.org/virtualbox/5.0.12/VirtualBox-5.0.12-104815-OSX.dmg',
        'https://github.com/docker/machine/releases/download/v0.5.6/docker-machine_darwin-amd64',
        'https://github.com/docker/compose/releases/download/1.5.2/docker-compose-Darwin-x86_64',
        'https://raw.githubusercontent.com/kalabox/kalabox/v0.10/dockerfiles/syncthing/config.xml',
        'https://github.com/syncthing/syncthing/releases/download/v0.11.26/syncthing-macosx-amd64-v0.11.26.tar.gz'
      ],
      dest: './deps/osx64'
    },
    win64Deps: {
      src: [
        'http://download.virtualbox.org/virtualbox/5.0.12/VirtualBox-5.0.12-104815-Win.exe',
        'https://github.com/docker/machine/releases/download/v0.5.6/docker-machine_windows-amd64.exe',
        'https://github.com/docker/compose/releases/download/1.5.2/docker-compose-Windows-x86_64.exe',
        'https://github.com/msysgit/msysgit/releases/download/Git-1.9.5-preview20150319/Git-1.9.5-preview20150319.exe',
        'https://raw.githubusercontent.com/kalabox/kalabox/v0.10/dockerfiles/syncthing/config.xml',
        'https://github.com/syncthing/syncthing/releases/download/v0.11.26/syncthing-windows-amd64-v0.11.26.zip'
      ],
      dest: './deps/win64'
    },
    linux64Deps: {
      src: [
        'https://github.com/docker/machine/releases/download/v0.5.6/docker-machine_linux-amd64',
        'https://github.com/docker/compose/releases/download/1.5.2/docker-compose-Linux-x86_64',
        'https://raw.githubusercontent.com/kalabox/kalabox/v0.10/dockerfiles/syncthing/config.xml',
        'https://github.com/syncthing/syncthing/releases/download/v0.11.26/syncthing-linux-amd64-v0.11.26.tar.gz'
      ],
      dest: './deps/linux64'
    },

    /*
     * Downlaod the iso image for our kalabox VM
     * @todo: get this from Kalabox as well
     */
    iso: {
      src: [
        'https://github.com/kalabox/kalabox-iso/releases/download/v0.11.0/boot2docker.iso'
      ],
      dest: './deps/iso'
    }
  },
  // jscs:enable

  /**
   * Clean out the build dirs
   */
  clean: {
    deps: [
      './deps',
    ]
  },

  /**
   * The `copy` task just copies files from A to B. We use it here to copy
   * our project assets (images, fonts, etc.) and javascripts into
   * `build_dir`, and then to copy the assets to `compile_dir`.
   */
  copy: {
    deps: {
      files: [
        {
          src: ['**/*'],
          dest: '<%= buildDir %>/deps/',
          cwd: 'deps/',
          expand: true
        }
     ]
    }
  }
};
