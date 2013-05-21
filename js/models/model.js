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
                that.set('mainStats', data.stats);  // stats must be set first
                that.set('mainData', data.results);
                console.log('fetch');
            };
            mainOptions.error = function(jqXHR, status, err) {
                console.log(status);
                that.set('mainData', null);
                that.set('mainStats', null);
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
                rangeOptions.error = function(jqXHR, status, err) {
                    console.log(status);
                    that.set('rangeData', null);
                };
                Backbone.sync('read', this, rangeOptions);
            }
        }
    });

})(jQuery);
