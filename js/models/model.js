Models = window.Models || {};

(function($) {
    console.log('Models');

    /* Dataset, request handler */
    Models.Dataset = Backbone.Model.extend({
        defaults: {
            options: {
                target: ['statsd.yastatsd.*.count']
            }
        },
        //initialize: function() {
        //    // Graphite API options
        //    this.set('options', {
        //        target: ['statsd.yastatsd.*.count']
        //    });
        //},
        request: function() {
            // new request, default options
            var options = this.get('options');
            delete options.from;
            delete options.until;
            this.requestMain();
            this.requestRange();
        },
        requestMain: function() {
            var that = this;
            var options = this.get('options');
            $.ajax({
                url: 'http://devenv.dev.sys:5000/data',
                data: options,
                jsonp: 'jsonp',
                success: function(data) {
                    that.set('mainData', data.results);
                    that.set('mainStats', data.stats);
                    that.trigger('updateMain', that.get('mainData'));
                    that.trigger('updateStats', that.get('mainStats'));
                },
                error: function(err) {
                    console.log('AJAX error');
                    //selected = true;    // stop auto-requests
                }
            });
        },
        requestRange: function() {
            var that = this;
            var rangeOptions = $.extend(true, { from: 0 }, this.get('options'));
            delete rangeOptions.until;
            $.ajax({
                url: 'http://devenv.dev.sys:5000/data',
                data: rangeOptions,
                jsonp: 'jsonp',
                success: function(data) {
                    that.set('rangeData', data.results);
                    that.trigger('updateRange', that.get('rangeData'));
                }
            });
        },
    });

})(jQuery);
