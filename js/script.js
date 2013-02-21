(function($) {

    var graphWidget = $('<div class="graph widget"></div>');
    var widgetContainer = $('.widget.container');

    var options = {
        series: { lines: { show: true } },
        grid: { markings: [ { xaxis: { from: 0, to: 0 }, color: 'black' } ] }
    };

    var dataset = [];
    for (var i = -20; i <= 20; i++) {
        var data = [i, i * i];
        dataset.push(data);
    }

    widgetContainer.append(graphWidget);
    $.plot(graphWidget, [dataset], options);

})(jQuery);
