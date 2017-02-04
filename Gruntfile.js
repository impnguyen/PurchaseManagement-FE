'use strict';
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        dir: {
            src: 'WebContent',
            root: './',
            bower_components: 'bower_components',
            dist: 'build'
        },

        clean: ['<%= dir.dist %>', '<%= dir.src %>/<%= dir.bower_components %>/signature_pad/*'],

        copy: {
            general: {
                cwd: '<%= dir.root %>',     // set working folder / root to copy
                src: [
                    '**/*',
                    '!**bower_components/**',
                    '!**/node_modules/**',
                    '!**/bower.json',
                    '!**/Gruntfile.js',
                    '!**/package.json'

                ],                          // copy all files and subfolders
                dest: '<%= dir.dist %>',    // destination folder
                expand: true                // required when using cwd
            },
            libs: {
                cwd: '<%= dir.root %>',
                src: [
                    '<%= dir.bower_components %>/signature_pad/*',

                ],
                dest: '<%= dir.dist %>/<%= dir.src %>/libs',
                expand: true
            },
            lib: {
                cwd: '<%= dir.root %>',
                src: [
                    '<%= dir.bower_components %>/signature_pad/*',

                ],
                dest: '<%= dir.src %>/libs',
                expand: true
            }
        },

        connect: {
            options: {
                port: 8092,
                hostname: '*',
                keepalive: true
            },
            src: {},
            dist: {}
        },

        openui5_connect: {
            options: {
                resources: [
                    '<%= dir.bower_components %>/openui5-sap.ui.core/resources',
                    '<%= dir.bower_components %>/openui5-sap.m/resources',
                    '<%= dir.bower_components %>/openui5-sap.ui.layout/resources',
                    '<%= dir.bower_components %>/openui5-sap.ui.unified/resources',
                    '<%= dir.bower_components %>/openui5-themelib_sap_belize/resources',
                    '<%= dir.bower_components %>/signature_pad'
                ],
                cors: {
                    origin: '*'
                }
            },
            src: {
                options: {
                    appresources: '<%= dir.src %>'
                }
            }
        }

    });

    // tasks.
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-openui5');
    // grunt.loadNpmTasks('grunt-contrib-copy');
    // grunt.loadNpmTasks('grunt-contrib-clean');

    // Default task(s).
    //grunt.registerTask('build', ['clean', 'copy']);
    grunt.registerTask('libs', ['clean', 'copy:lib'])
    grunt.registerTask('deploy', ['openui5_connect']);

};