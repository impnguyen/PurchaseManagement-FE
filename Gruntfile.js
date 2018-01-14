'use strict';
module.exports = function (grunt) {

	// Project configuration.
	grunt
		.initConfig({ // TODO: update to grunt.config.init
			pkg: grunt.file.readJSON('package.json'),
			dir: {
				src: 'WebContent',
				root: './',
				bower_components: 'bower_components',
				dist: 'build',
				jsdoc: 'doc/jsdoc'
			},

			// server
			local: {
				"port": "8081",
				"uri": "http://localhost"
			},

			// clean task option
			clean: ['<%= dir.dist %>'],

			// copy task option
			copy: {
				general: {
					cwd: '<%= dir.src %>',
					src: ['**/*', '!**bower_components/**',
						'!**/node_modules/**', '!**/bower.json',
						'!**/Gruntfile.js', '!**/package.json'
					], 
					dest: '<%= dir.dist %>',
					expand: true
				},
				local_general: {
					cwd: '<%= dir.src %>',
					src: ['**/*', '!**bower_components/**',
						'!**/node_modules/**', '!**/bower.json',
						'!**/Gruntfile.js', '!**/package.json', '**/!index.html'
					], 
					options: {
						process: function (content, srcpath) {
						  return content.replace('192.168.20.20', 'localhost');
						},
					  },
					dest: '<%= dir.dist %>',
					expand: true
				},
				ui5: {
					cwd: '<%= dir.src %>',
					src: ['**/index.html'
					], 
					options: {
						// process: function (content, srcpath) {
						//   return content.replace('192.168.20.20', 'localhost');
						// },
					  },
					dest: '<%= dir.dist %>',
					expand: true
				},
				libs: {
					cwd: '<%= dir.root %>',
					src: ['<%= dir.bower_components %>/signature_pad/*',

					],
					dest: '<%= dir.dist %>/<%= dir.src %>/libs',
					expand: true
				},
				lib: {
					cwd: '<%= dir.root %>',
					src: ['<%= dir.bower_components %>/signature_pad/*',

					],
					dest: '<%= dir.src %>/libs',
					expand: true
				}
			},

			// webserver task option
			connect: {
				options: {
					port: '<%= local.port %>',
					hostname: '*',
					keepalive: false,
					debug: true,
					livereload: true,
					open: {
						appName: "Google Chrome"
					}
				},
				src: {},
				dist: {}
			},

			// deploy ui5 webapp option
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
						appresources: '<%= dir.dist %>'
					}
				}
			},

			// open task
			open: {
				dev: {
					path: '<%= local.uri %>:<%= local.port %>',
					app: "Google Chrome",
					options: {
						openOn: 'serverListening'
					}
				}
			},

			// build preload task option
			openui5_preload: {
				component: {
					options: {
						resources: {
							cwd: '<%= dir.dist %>',
							prefix: 'mpn'
						},
						dest: '<%= dir.dist%>'
					},
					components: true
				}
			},

			// ftp deploy task option
			'ftp-deploy': {
				build: {
					auth: {
						host: '192.168.20.20',
						port: 21,
					},
					src: '<%= dir.dist %>',
					dest: './pm',
					exclusions: []
				}
			},

			// js hint task option
			jshint: {
				all: ['<%= dir.dist%>/**/*.js',
					'!<%= dir.dist%>/PM/Component-preload.js',
					'!<%= dir.dist%>/PM/libs/**/*.js'
				],
				options: {
					reporter: require('jshint-jenkins-checkstyle-reporter'), //disabled
					reporterOutput: 'report-jshint-checkstyle.xml' //disable
				}
			},

			// xml hint task option
			validate_xml: {
				views: {
					src: ['<%= dir.dist%>/**/*.xml']
				},
			},

			// jsdoc task option
			jsdoc: {
				dist: {
					src: ['<%= dir.src %>/**/*.js',
						'!<%= dir.src %>/PM/libs/**/*.js'
					],
					options: {
						destination: '<%= dir.jsdoc%>',
						template: "node_modules/ink-docstrap/template",
						configure: "jsdoc/template/jsdoc.conf.json"
					}
				}
			},

			// string replace task option
			'string-replace': {
				inline: {
					files: {
						'./': '<%= dir.dist%>/PM/controller/stats.controller.js',
					},
					options: {
						replacements: [{
							pattern: 'sap.ui.getCore().loadLibrary("openui5.googlemaps", "/Pm/libs/googlemaps/");',
							replacement: 'sap.ui.getCore().loadLibrary("openui5.googlemaps", "/Pm/PM/libs/googlemaps/");'
						}]
					}
				}
			},

			// watch task option
			watch: {
				scripts: {
					files: ['<%= dir.src %>/**/*.js', '<%= dir.src %>/**/*.xml', '<%= dir.src %>/index.html', '<%= dir.src %>/**/*.json'],
					tasks: ['local_build'],
					options: {
						livereload: true,
					},
				},
			}
		});

	// tasks.
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-ftp-deploy');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-openui5');
	grunt.loadNpmTasks('grunt-contrib-jshint'); // todo: migrate to eslint
	grunt.loadNpmTasks('grunt-contrib-validate-xml');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-string-replace');
	grunt.loadNpmTasks('grunt-open');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task(s).
	grunt.registerTask('local', ['openui5_connect']);
	grunt.registerTask('ftp', ['ftp-deploy']);
	grunt.registerTask('dev', ['local']);

	/**
	 * Jenkins tasks
	 */
	// Jenkins validation tasks
	grunt.registerTask('val_js', ['jshint']);
	grunt.registerTask('val_xml', ['validate_xml:views']);
	// opa5
	// qunit
	// selenium webdriver io

	// Jenkins build tasks
	grunt.registerTask('clean_build_dir', ['clean']);
	grunt.registerTask('copy_to_build_dir', ['copy:general']);
	grunt.registerTask('build_preload_js', ['openui5_preload']);
	grunt.registerTask('run_build', ['openui5_connect']);
	grunt.registerTask('replace_lib', ['string-replace']);

	// Jenkins documentation tasks
	grunt.registerTask('createJsdoc', ['jsdoc:dist']);

	// aggregated tasks
	grunt.registerTask('jenk_build', ['clean_build_dir', 'copy_to_build_dir', 'val_js', 'val_xml', 'replace_lib', 'build_preload_js']); // 'build_preload_js'
	grunt.registerTask('local_build', ['clean_build_dir', 'copy:local_general', 'copy:ui5', 'val_js', 'val_xml', 'run_build', 'build_preload_js']); // 'build_preload_js'
	// grunt.registerTask('watch_build', ['clean_build_dir', 'copy_to_build_dir', 'val_js', 'val_xml', 'build_preload_js']);
	grunt.registerTask('local', function () {
		grunt.task.run('openui5_connect');
		grunt.task.run('watch');
	});

};