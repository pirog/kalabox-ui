'use strict';
/**
 * Provide custom tasks
 */
var exec = require('child_process').exec;

module.exports = function (grunt) {
  grunt.registerTask('bowerInstall', function () {
    var cb = this.async();
    exec('bower install  --config.interactive=false',
    {cwd: __dirname +'/..'},
    function (err, out) {
      if (err instanceof Error) {
        grunt.fail.warn(err);
        grunt.log.write(err);
      }
      if (out) {
        grunt.log.write(out);
      }
      cb();
    });
  });
};
