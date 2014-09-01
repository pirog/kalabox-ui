module.exports = function(grunt) {
  grunt.registerTask('protractor-setup', 'Protractor setup task', function() {
    // quick check for the appropriate directories to run protractor
    var fs = require('fs');
    var path = require('path');
    var pconfig = require('../src/lib/pconfig');
    var dir = 'test/support';

    var symlinkDst = path.resolve(dir, pconfig.devSymlink.file);
    var cdFile = path.resolve(dir, 'chromedriver');

    var supportExists = fs.existsSync(dir);
    var symlinkExists = fs.existsSync(symlinkDst);
    var cdExists = fs.existsSync(cdFile);

    if (supportExists && symlinkExists && cdExists) {
      return;
    }

    // something doesn't exist so check & install everything.
    var done = this.async();
    var http = require('http');
    var request = require('request');
    var unzip = require('unzip');
    var symlinkFile = pconfig.devSymlink.file;
    var symlinkPath = path.normalize(pconfig.devSymlink.path);
    var symlinkSrc = path.resolve(symlinkPath, symlinkFile);
    var cdRemote = pconfig.chromedriverDownload;
    var cdLocal = path.resolve(dir, pconfig.chromedriverDownload.split('/').pop());

    grunt.log.writeln(cdLocal);
    done();
    return;


    var download = function(url, dest, cb, cbdone) {
      var file = fs.createWriteStream(dest);
      http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
          cb(cbdone);
        });
      });
    };

    var extractChromedriver = function(cbdone) {
      grunt.log.writeln('Extracting node-webkit chromedriver.');

      if (pconfig.platform === 'linux') {
        var targz = require('tar.gz');
        var compress = new targz().extract(cdLocal, dir, function(err){
          if(err)
            console.log(err);

          grunt.log.writeln('Protractor setup is complete.');
          grunt.log.writeln('To run tests, you may now run: grunt e2e');
          cbdone();
        });
      }
      else {
        fs.createReadStream(cdLocal)
          .pipe(unzip.Parse())
          .on('entry', function (entry) {
            if (entry.path.indexOf('/chromedriver') >= 0) {
              entry.pipe(fs.createWriteStream(cdFile));
            } else {
              entry.autodrain();
            }
          })
          .on('finish', function() {
            // *nix only?
            fs.chmodSync(cdFile, 0755);
            grunt.log.writeln('Protractor setup is complete.');
            grunt.log.writeln('To run tests, you may now run: grunt e2e');
            cbdone();
          });
      }
    };

    if (!supportExists) {
      grunt.log.writeln('Creating support directory.');
      fs.mkdir(dir);
    }

    if (!symlinkExists) {
      grunt.log.writeln('Creating support link to node-webkit.');
      fs.symlinkSync(symlinkSrc, symlinkDst);
    }

    if (!cdExists) {
      grunt.log.writeln('Downloading node-webkit chromedriver.');
      download(
        cdRemote,
        cdLocal,
        extractChromedriver,
        done);
    }
  });
};
