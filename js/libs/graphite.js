// Graphite.js
// Graphite URL API Handler
// Idealist.org

// Instantiate new Graphite object with an 'options' object parameter
// A URL will be generated with the specified options,
// just call object.ajax()

// e.g.
// https://graphite.dev.awbdev.org/render?target=statsd.lomo.i3.signup.attempts\
//     &format=json&from=-2d&until=-1d
// var graphite = new Graphite({
//     baseUrl: 'https://graphite.dev.awbdev.org',  *
//     targets: ['statsd.lomo.i3.signup.attempts'], *
//     success: function(d) { ... },                *
//     format: 'json',
//     from: '-2d',
//     until: '-1d'
// });
//                                                  * = required field

// TODO: allow for input of complete url, parse backwards

(function($) {

    /* 
     * valid options: from, until (requires from), 
     *     
     */
    Graphite = function (options) {
        this.options = options;
        this.generateUrl();
    };

    /* generate graphite-compliant url */
    Graphite.prototype.generateUrl = function() {
        var that = this;
        this.url = '';
        var reqkeys = ['baseUrl', 'targets', 'success'];
        var keys = Object.keys(this.options);
        for (var i = 0; i < reqkeys.length; i++) {
            var ki = keys.indexOf(reqkeys[i]);
            keys.splice(ki, ki !== 0 ? ki : ki + 1);
        }
        // http[s]:// url prefix
        if (this.options.baseUrl.match(/^http[s]{0,1}:\/\//) === null) {
            this.url = 'http://' + this.options.baseUrl;
        }
        else {
            this.url = this.options.baseUrl;
        }
        if (this.url[this.url.length - 1] !== '/') {
            this.url += '/';
        }
        this.url += 'render?';
        if (Object.prototype.toString.call(this.options.targets) ===
            '[object Array]') {
            this.url += 'target=' + this.options.targets.join('&target=');
        }
        else {      // singular string target
            this.url += 'target=' + targets;
        }
        // parse options
        keys.forEach(function(key) {
            that.url += '&' + key + '=' + that.options[key];
        });
        // cross domain policy for jsonp
        if (this.options.format === 'json' &&
            typeof this.options.jsonp === 'undefined') {
            this.url += '&jsonp=?';
        }
    }

    /* define jquery ajax call */
    Graphite.prototype.ajax = function() {
        var that = this;
        var ajaxOptions = {
            url: that.url,
            dataType: that.options.format,
            success: that.options.success
        };
        if (this.options.format === 'json' &&
            typeof this.options.jsonp === 'undefined') {
            ajaxOptions.jsonp = 'jsonp';
        }
        if (this.options.format === 'raw') {
            ajaxOptions.format = 'text';
        }
        $.ajax(ajaxOptions);
    };

}) (jQuery);
