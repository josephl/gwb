// require
//

requirejs.config({
    shim: {
        //'libs/jquery': {
        //    exports: '$'
        //},
        'libs/underscore': {
            exports: '_'
        },
        'libs/backbone': {
            deps: ['libs/underscore', 'libs/jquery'],
            exports: 'Backbone'
        },
        'libs/jquery-ui': {
            deps: ['libs/jquery']
        },
        'libs/jquery.flot': {
            deps: ['libs/jquery'],
            exports: 'plot'
        },
        'libs/jquery.flot.time': {
            deps: ['libs/jquery.flot']
        },
        'libs/jquery.flot.selection': {
            deps: ['libs/jquery.flot']
        },
        'libs/jquery.flot.pie': {
            deps: ['libs/jquery.flot']
        },
//        'libs/jquery.flot.stack': {
//            deps: ['libs/jquery.flot']
//        },
//        'models/model': {
//            deps: ['libs/jquery', 'libs/backbone',
//            'libs/jquery.flot', 'libs/jquery.flot.time',
//            'libs/jquery.flot.stack']
//        },
//        'views/ctrl': {
//            deps: ['libs/jquery', 'libs/backbone',
//            'libs/jquery.flot', 'libs/jquery.flot.time',
//            'libs/jquery.flot.stack']
//        },
        'script': {
            deps: ['libs/jquery', 'libs/jquery-ui', 'libs/jquery.flot',
                   'libs/jquery.flot.time', 'libs/jquery.flot.selection',
                   'libs/jquery.flot.pie']
        }
    }
});

define(
    ['libs/underscore', 'libs/backbone', 'libs/jquery-ui', 'libs/jquery.flot',
     'libs/jquery.flot.time', 'libs/jquery.flot.selection', 'libs/jquery.flot.pie',
     'script'],
    function(underscoreLocal, backboneLocal, uiLocal, flotLocal,
        flotTimeLocal, flotSelectionLocal, flotPieLocal, scriptLocal) {
    }
);
