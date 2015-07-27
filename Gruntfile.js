'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Automatically load required grunt tasks
  require('jit-grunt')(grunt, {
      useminPrepare: 'grunt-usemin'
  });

  // Configurable paths
  var config = {
    client: 'public/js',
    lib: 'public/lib',
    css: 'public/css',
    specs: 'specs',
    dist: 'public/dist'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    config: config,

    clean: {
      lib: ['<%= config.lib %>/*.js']
    },

    concat: {
      options: {
        seperator: ';'
      },
      lib: {
        src: [
          'bower_components/angular/angular.min.js',
          'bower_components/angular-mocks/angular-mocks.js',
          'bower_components/angular-route/angular-route.min.js'
        ],
        dest: '<%= config.lib %>/lib.js'
      }
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      client: {
        files: ['<%= config.client %>/**/*.js', '!node_modules/**/*.js'],
        tasks: ['jshint:client', 'mochaTest:client']
      },
      server: {
        files: ['**/*.js', '!<%= config.client %>/**/*.js', '!node_modules/**/*.js'],
        tasks: ['jshint:server', 'mochaTest:server']
      },
    },

    jshint: {
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          'node_modules/**/*.js',
          'bower_components/**/*.js',
          '<%= config.lib %>/**/*.js'
        ]
      },
      client: {
        src: '<%= config.client %>/**/*.js',
      },
      server: {
        src: ['**/*.js', '!<%= config.client %>/**/*.js']
      }
    },

    mochaTest: {
      client: {
        src: ['<%= config.specs %>/client/*.js']
      },
      server: {
        src: ['<%= config.specs %>/server/*.js']
      }
    },

    nodemon: {
      local: {
        script: 'app.js'
      }
    }
  });

  grunt.registerTask('local', function() {
    var nodemon = grunt.util.spawn({
      cmd: 'grunt',
      grunt: true,
      args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run(['watch']);
  });

  grunt.registerTask('test', ['mochaTest']);

  // grunt.registerTask('karma', ['karma']);

  grunt.registerTask('build', [
    'jshint',
    'test',
    'clean',
    'concat'
  ]);

  grunt.registerTask('default', 'local');
};
