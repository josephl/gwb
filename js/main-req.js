// require
//

requirejs.config({
    shim: {
        'libs/underscore': {
            exports: '_'
        },
        'libs/backbone': {
            deps: ['libs/underscore', 'libs/jquery'],
            exports: 'Backbone'
        },
        'libs/d3': {
            deps: ['libs/jquery'],
            exports: 'd3'
        },
        'libs/jquery.flot': {
            deps: ['libs/jquery']
        },
        'libs/jquery.flot.time': {
            deps: ['libs/jquery.flot'],
        },
        'libs/jquery.flot.stack': {
            deps: ['libs/jquery.flot']
        },
        'libs/crossfilter': {},
        'libs/graphite': {
            deps: ['libs/jquery', 'libs/underscore']
        },
        'models/model': {
            deps: ['libs/jquery', 'libs/backbone', 'libs/crossfilter',
            'libs/jquery.flot', 'libs/jquery.flot.time',
            'libs/jquery.flot.stack']
        },
        'views/view': {
            deps: ['libs/jquery', 'libs/backbone', 'libs/crossfilter',
            'libs/jquery.flot', 'libs/jquery.flot.time',
            'libs/jquery.flot.stack']
        },
        'script': {
            deps: ['libs/jquery', 'models/model', 'views/view',
            'libs/graphite']
        }
    }
});

define(
    ['libs/underscore', 'libs/backbone', 'libs/d3', 'script'],
    function(underscoreLocal, backboneLocal, d3Local) {
    }
);
