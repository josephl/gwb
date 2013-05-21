(function($) {
    d = new Models.Dataset();
    var opts = d.get('options').get('data');
    opts.dayStart = 5;
    opts.dayEnd = 12;
    widget = new Views.Widget({ model: d });
})(jQuery);
