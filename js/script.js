(function($) {
    var dataOptions = {
        target: 'statsd.yastatsd.*.count'
        //target: ['bitcoin.avg', 'bitcoin.high', 'bitcoin.low'],
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

    /* States */
    var selected = false;   // selected state, determine if auto-updates occur

    /*
     * Flot Graph Options
     */
    var flotOptions = {
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
        xaxis: { mode: 'time', timezone: 'browser' },
        legend: { position: 'ne' },
        selection: { mode: 'x' }
    };
    var flotRangeOptions = {
        series: { 
        lines: {
            show: true,
            lineWidth: 0.75
        },
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
                console.log('data received');
                window.mainPlot = $.plot(mainGraphWidget,
                                         data.results,
                                         flotOptions);
                renderStats(data);
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
        if (!selected)
            requestData();
        setTimeout(update, 10000);
    }
    update();

    /* Stats panel */
    function renderStats(dataset) {
        console.log(dataset);
        // pie chart
        if (dataset.results.length > 1) {
            //var pieData = _.map(dataset.stats, function(d) { return d.sum; });
            //console.log(pieData);
            var pieData = [];
            pieGraph.css('display', 'inline');
            for (var i = 0; i < dataset.results.length; i++) {
                pieData.push({
                    data: dataset.stats[i].sum,
                    label: ''
                });
            }
            $.plot(pieGraph, pieData, {
                series: {
                    pie: {
                        show: true,
                        //innerRadius: 0.65
                    },
                },
                grid: {
                    clickable: true,
                    hoverable: true
                },
                legend: { show: false }
            });
        }
        var statsPanel = $('.panel.stats');
        statsPanel.text(dataset.stats[0].mean);
    }

    /* Selection Handlers */
    function onPlotSelect(event, ranges) {
        selected = true;
        console.log('onPlotSelect');
        console.log(ranges);
        dataOptions.from = parseInt(ranges.xaxis.from / 1000);
        dataOptions.until = parseInt(ranges.xaxis.to / 1000);
        requestMain();
    }
    function onPlotUnselect(event) {
        // refresh main and range graphs
        console.log('onPlotUnselect');
        selected = false;
        delete dataOptions.from;
        delete dataOptions.until;
        requestMain();
        requestRange();
    }

})(jQuery);
