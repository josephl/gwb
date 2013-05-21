Options = window.Options || {};
console.log('Options');

(function($) {

    /* Flot Graph Options */
    Options.FlotMain = Backbone.Model.extend({
        initialize: function() {
            this.set({
                series: { 
                    lines: {
                        show: true,
                        lineWidth: 1.25
                    },
                    shadowSize: 0
                },
                grid: {
                    markings: [ { xaxis: { from: 0, to: 0 }, color: 'black' } ],
                    borderWidth: 0,
                    hoverable: true,
                    autoHighlight: true,
                },
                xaxes: [ { mode: 'time', timezone: 'browser' } ],
                yaxes: [ { position: 'left' },
                    {
                        alignTicksWithAxis: false,
                        position: 'right'
                    }
                ],
                legend: { show: false },
                selection: { mode: 'x' }
            });
        }
    });

    Options.FlotRange = Backbone.Model.extend({
        initialize: function() {
            this.set({
                series: { 
                lines: {
                    show: true,
                    lineWidth: 0.75
                },
                    shadowSize: 0
                },
                grid: {
                    markings: [
                        { xaxis: { from: 0, to: 0 }, color: 'black' }
                    ],
                    borderWidth: 0,
                },
                xaxis: { mode: 'time', timezone: 'browser' },
                yaxis: { show: false },
                legend: { show: false },
                selection: { mode: 'x' }
            });
        }
    });

    /* Flot Pie Graph */
    Options.FlotPie = Backbone.Model.extend({

        initialize: function() {
            this.set({
                series: {
                    pie: {
                        show: true
                    },
                },
                grid: {
                    clickable: true,
                    hoverable: true
                },
                legend: { show: false }
            });
        }

    });

})(jQuery);
