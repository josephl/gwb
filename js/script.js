(function($) {
    var dataOptions = {
        target: ['statsd.yastatsd.*.count'],
        //target: ['bitcoin.avg', 'bitcoin.high', 'bitcoin.low'],
        //target: 'statsd.lomo.xapian.*.timer.*.count'
        //target: ['statsd.lomo.i3.signup.attempts', 'statsd.lomo.i3.signup.password.mismatch']
    };

    var mainGraphWidget = $('.main.graph.widget');
    var rangeGraphWidget = $('.range.graph.widget');
    var widgetContainer = $('.widget.container');
    var metricInput =  $('input.metric');
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
    var dataset;    // main request data
    var seriesIndex;
    var separateAxis;   // seriesIndex of metric on separate axis

    metricInput.val(dataOptions.target);
    update();

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
        xaxes: [ { mode: 'time', timezone: 'browser' } ],
        yaxes: [ { position: 'left' },
            {
                alignTicksWithAxis: false,
                position: 'right'
            }
        ],
        //legend: { position: 'ne' },
        legend: { show: false },
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
    // Timer function
    function update() {
        console.log('update');
        if (!selected && typeof seriesIndex === 'undefined')
            requestData();
        setTimeout(update, 10000);
    }
    //update();

    /* Stats panel */
    function renderStats() {
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

            /*  pie chart interactivity */
            pieGraph.unbind('plotclick');
            pieGraph.bind('plotclick', function(e, pos, obj) {
                if (typeof seriesIndex === 'undefined' ||
                        seriesIndex != obj.seriesIndex) {
                    seriesIndex = obj.seriesIndex;
                }
                else {
                    seriesIndex = undefined;
                }
                console.log(seriesIndex);
                updateStatsPanel(seriesIndex);
            });
        }
        else {  // single dataset
            pieGraph.css('display', 'none');
        }
        updateStatsPanel();
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

    /* Events */

    // Input metric name
    metricInput.keypress(function(e) {
            if (e.which == 13) {
                console.log($(this).val());
                // parse target metric names
                var rawTargets = $(this).val();
                dataOptions.target = _.map(rawTargets.split(','), function(t) {
                    return t.trim();
                });
                console.log(dataOptions.target);
                update();
            }
        })
        .focusin(function(event) {
            //$(event.target).val('');
            $(this).select()
        })
        .focusout(function(event) {
            if(event.target.value == '') {
                $(this).val(dataOptions.target);
            }
        })
        .change(function(d) {
            console.log('change places!');
            console.log(this);
        });

    // Breakout single metric to separate axis
    function breakout(e) {
        console.log(e);
        console.log('breakout');
        if (typeof separateAxis === 'undefined' ||
                dataset.results[seriesIndex].yaxis === 1) {
            dataset.results[seriesIndex].yaxis = 2;
            separateAxis = seriesIndex;
        }
        else {
            separateAxis = undefined;
            dataset.results[seriesIndex].yaxis = 1;
        }
        window.mainPlot = $.plot(mainGraphWidget,
                                 dataset.results,
                                 flotOptions);
    }

    /* Stats Panel Generator */
    function updateStatsPanel() {
        var startIndex, endIndex;
        // determine if only single index specified
        if (typeof seriesIndex === 'undefined') {
            startIndex = 0;
            endIndex = dataset.results.length;
        }
        else {
            startIndex = seriesIndex;
            endIndex = seriesIndex + 1;
        }
        console.log('updateStatsPanel');
        var options = window.mainPlot.getOptions();
        var statsPanel = $('.stats.panel');
        panelHTML = dateRange(dataset);
        for (var i = startIndex; i < endIndex; i++) {
            var curStats = dataset.stats[i],
                label = dataset.results[i].label,
                color = options.colors[i],
                mean = parseFloat(curStats.mean).toFixed(2),
                median = parseFloat(curStats.quartile[1]).toFixed(2),
                variance = parseFloat(curStats.var).toFixed(2),
                freq = curStats.freq,
                colorbox = '<div class="color-box" style="background-color:'
                + color + ';"></div>';
            statsList = $('<ul>' + colorbox + label + 
                '<br></ul>');

            if (typeof seriesIndex !== 'undefined') {
                statsList.append('<li>Frequency: ' + freq + '</li>');
                statsList.append('<li>Mean: ' + mean + '</li>');
                statsList.append('<li>Median: ' + median + '</li>');
                statsList.append('<li>Variance: ' + variance + '</li>');
            }
            panelHTML += statsList.html();
        }
        // Additional options if single stat is focused
        if (typeof seriesIndex !== 'undefined') {
            var singleOptions = $('<div />');
            singleOptions.attr('class', 'single-options');
            var breakoutButton = $('<button>Breakout</button>')
                .button()
                .attr('class', 'breakout');
            singleOptions.append(breakoutButton);
            panelHTML += singleOptions.html();
        }
        statsPanel.html(panelHTML);
        $('.breakout').click(breakout);
    }

    function dateRange() {
        console.log('dateRange');
        var results = dataset.results;
        start = new Date(_.min(_.map(results, function (d) {
                        return d.data[0][0];
                    })));
        end = new Date(_.max(_.map(results, function (d) {
                        return _.last(d.data)[0];
                        })));
        console.log(start);
        console.log(end);
        return '<p>' + start.toDateString() + ' - ' +
            start.toLocaleTimeString() + ' to<br>' +
            end.toDateString() + ' - ' +
            end.toLocaleTimeString() + '</p>';
    }

})(jQuery);
