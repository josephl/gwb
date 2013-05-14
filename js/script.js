(function($) {
    var dataOptions = {
        //target: 'statsd.yastatsd.*.count'
        target: ['bitcoin.avg', 'bitcoin.high', 'bitcoin.low'],
        //target: 'statsd.lomo.xapian.*.timer.*.count'
        //target: ['statsd.lomo.i3.signup.attempts', 'statsd.lomo.i3.signup.password.mismatch']
    };

    var mainGraphWidget = $('.main.graph.widget');
    var rangeGraphWidget = $('.range.graph.widget');
    var widgetContainer = $('.widget.container');
    var pieGraph = $('.graph.pie');
    var dayRange = $('.dayRange').slider({
        range: true,
        min: 0,
        max: 24,
        values: [0, 24],
        change: function (event, ui) {
            console.log(ui.values);
            dataOptions.dayStart = ui.values[0];
            dataOptions.dayEnd = ui.values[1];
            requestMain();
        }
    });

    var flotOptions = {
        series: { 
            lines: { show: true },
            shadowSize: 0
        },
        grid: {
            markings: [ { xaxis: { from: 0, to: 0 }, color: 'black' } ],
            borderWidth: 0,
            hoverable: true,
            autoHighlight: true,
        },
        xaxis: { mode: 'time', timezone: 'browser' },
        legend: { position: 'ne' },
        selection: { mode: 'x' }
    };
    var flotRangeOptions = {
        series: { 
            lines: { show: true },
            shadowSize: 0
        },
        grid: {
            markings: [ { xaxis: { from: 0, to: 0 }, color: 'black' } ],
            borderWidth: 0,
            //autoHighlight: true,
        },
        xaxis: { mode: 'time', timezone: 'browser' },
        yaxis: { show: false },
        legend: { show: false },
        selection: { mode: 'x' }
    };

    // selection event
    rangeGraphWidget.bind('plotselected', onPlotSelect);
    rangeGraphWidget.bind('plotunselected', onPlotUnselect);
    mainGraphWidget.bind('plotselected', onPlotSelect);
    mainGraphWidget.bind('plotunselected', onPlotUnselect);

    var mainPlot, rangePlot;    // plot objects
    // temp debug
    window.mainPlot = mainPlot;
    window.rangePlot = rangePlot;
    /* AJAX request for main graph */
    function requestMain() {
        console.log(dataOptions);
        $.ajax({
            url: 'http://devenv.dev.sys:5000/data',
            data: dataOptions,
            jsonp: 'jsonp',
            success: function(data) {
                window.mainPlot = $.plot(mainGraphWidget,
                                         data.results,
                                         flotOptions);
                renderStats(data.stats);
            }
        });
        console.log('requestMain');
    }

    /* AJAX request for range graph */
    function requestRange() {
        var rangeOptions = $.extend(true, {}, dataOptions);
        rangeOptions.from = '0';
        $.ajax({
            url: 'http://devenv.dev.sys:5000/data',
            data: rangeOptions,
            jsonp: 'jsonp',
            success: function(data) {
                console.log(flotRangeOptions);
                window.rangePlot = $.plot(rangeGraphWidget,
                                   data.results,
                                   flotRangeOptions);
            }
        });
        console.log('requestRange');
    }

    function requestData() {
        requestMain();
        requestRange();
    }
    function update() {
        console.log('update');
        requestData();
        //setTimeout(update, 10000);
    }
    update();

    /* Stats panel */
    function renderStats(stats) {
        console.log(stats);
        // pie chart
        if (stats.length > 1) {
            var pieData = _.map(stats, function(d) { return d.sum; });
            console.log(pieData);
            pieGraph.css('display', 'inline');
            $.plot(pieGraph, pieData, {
                series: {
                    pie: {
                        show: true,
                        innerRadius: 0.65
                    },
                },
                grid: {
                    clickable: true,
                    hoverable: true
                }
            });
        }
    }

    /* Selection Handlers */
    function onPlotSelect(event, ranges) {
        console.log('onPlotSelect');
        console.log(ranges);
        dataOptions.from = parseInt(ranges.xaxis.from / 1000);
        dataOptions.until = parseInt(ranges.xaxis.to / 1000);
        requestMain();
    }
    function onPlotUnselect(event) {
        // refresh main and range graphs
        console.log('onPlotUnselect');
        delete dataOptions.from;
        delete dataOptions.until;
        requestMain();
        requestRange();
    }

})(jQuery);
