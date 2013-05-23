(function($) {
    d = new Models.Dataset();
    var opts = d.get('options').get('data');
    widget = new Views.Widget({ model: d });
})(jQuery);
