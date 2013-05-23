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
        'models/model': {
            deps: ['libs/jquery', 'libs/backbone']
        },
        'models/options': {
            deps: ['libs/jquery', 'libs/backbone']
        },
        'views/view': {
            deps: ['libs/jquery', 'libs/backbone', 'models/model',
                   'models/options']
        },
        'script': {
            deps: ['libs/jquery', 'libs/jquery-ui', 'libs/jquery.flot',
                   'libs/jquery.flot.time', 'libs/jquery.flot.selection',
                   'libs/jquery.flot.pie', 'libs/backbone',
                   'models/model', 'views/view']
        }
    }
});

define(
    ['libs/underscore', 'libs/backbone', 'libs/jquery-ui', 'libs/jquery.flot',
     'libs/jquery.flot.time', 'libs/jquery.flot.selection', 'libs/jquery.flot.pie',
     'models/model', 'models/options', 'views/view', 'script'],
    function(underscoreLocal, backboneLocal, uiLocal, flotLocal,
        flotTimeLocal, flotSelectionLocal, flotPieLocal,
        modelsLocal, optionsLocal, viewsLocal, scriptLocal) {
    }
);
