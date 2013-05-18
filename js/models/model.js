Models = window.Models || {};

(function($) {
    console.log('models');
    Models.Widget = Backbone.Model.extend({
        initialize: function() {
        },
        dataOptions: {
            target: ['statsd.yastatsd.*.count']
        },
        requestMain: function() {
            var dataOptions = this.get('dataOptions');
            console.log(dataOptions);
            $.ajax({
                url: 'http://devenv.dev.sys:5000/data',
                data: dataOptions,
                jsonp: 'jsonp',
                success: function(data) {
                    console.log('data received');
                    dataset = data;
                    if (typeof separateAxis !== 'undefined') {
                        dataset.results[separateAxis].yaxis = 2;
                    }
                    window.mainPlot = $.plot(mainGraphWidget,
                                             dataset.results,
                                             flotOptions);
                    //console.log(dataset);
                    renderStats();
                },
                error: function(err) {
                    console.log('AJAX error');
                    selected = true;    // stop auto-requests
                }
            });
            console.log('requestMain');
        }

    });
})(jQuery);
