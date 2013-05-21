Models = window.Models || {};

(function($) {
    console.log('Models');

    /* Dataset, request handler */
    Models.Dataset = Backbone.Model.extend({
        initialize: function() {
            // Graphite API options
            this.set('options', new Options.Ajax({
                data: {
                    target: ['statsd.yastatsd.*.count']
                }
            }));
        },
        /* range: boolean, update full range graph */
        fetch: function(range) {
            var that = this;
            var mainOptions = this.get('options').toJSON();
            mainOptions.success = function(data) {
                that.set('mainData', data.results);
                that.set('mainStats', data.stats);
                that.trigger('updateMain', that.get('mainData'));
                that.trigger('updateStats', that.get('mainStats'));
                console.log('fetch');
            };
            Backbone.sync('read', this, mainOptions);

            if (!range) {
                var rangeOptions = $.extend(true, {}, this.get('options').toJSON());
                rangeOptions.data.from = 0;
                delete rangeOptions.data.until;
                rangeOptions.success = function(data) {
                    that.set('rangeData', data.results);
                    that.trigger('updateRange', that.get('rangeData'));
                    console.log('fetch');
                };
                Backbone.sync('read', this, rangeOptions);
            }
        }
    });

})(jQuery);
