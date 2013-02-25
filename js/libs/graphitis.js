// Graphitis.js
// Graphite URL API Handler
// Idealist.org

(function($) {

    Graphitis = function (options) {
        this.options = options;
        this.generateUrl();
        return this;
    };

    Graphitis.prototype.generateUrl = function() {
        var that = this;
        this.url = '';
        var reqkeys = ['baseUrl', 'targets', 'success'];
        var keys = Object.keys(this.options);
        for (var i = 0; i < reqkeys.length; i++) {
            var ki = keys.indexOf(reqkeys[i]);
            keys.splice(ki, ki !== 0 ? ki : ki + 1);
        }
        if (this.options.baseUrl.match(/^http[s]{0,1}:\/\//) === null) {
            this.url = 'http://' + this.options.baseUrl;
        }
        else {
            this.url = this.options.baseUrl;
        }
        if (this.url.match(/\/$/) === null) {
            this.url += '/';
        }
        this.url += 'render?';
        if (Object.prototype.toString.call(this.options.targets) ===
            '[object Array]') {
            this.url += 'target=' + this.options.targets.join('&target=');
        }
        else {
            this.url += 'target=' + targets;
        }
        keys.forEach(function(key) {
            that.url += '&' + key + '=' + that.options[key];
        });
        if (this.options.format === 'json' &&
            typeof this.options.jsonp === 'undefined') {
            this.url += '&jsonp=?';
        }
        return this;
    }

    Graphitis.prototype.ajax = function() {
        var that = this;
        var ajaxOptions = {
            url: that.url,
            dataType: this.options.format,
            success: this.options.success
        };
        if (this.options.format === 'json' &&
            typeof this.options.jsonp === 'undefined') {
            ajaxOptions.jsonp = 'jsonp';
        }
        if (this.options.format === 'raw') {
            ajaxOptions.format = 'text';
        }
        $.ajax(ajaxOptions);
        return this;
    };

    Graphite.prototype.set = function(param, value) {
        var objType = Object.prototype.toString.call(param);
        if (objType === '[object Object]' && typeof value === 'undefined') {
            keys = Object.keys(param);
            for (var k = 0; k < keys.length; k++) {
                this.options[keys[k]] = param[keys[k]];
            }
        }
        else if (objType === '[object String]') {
            this.options[param] = value;
        }
        this.generateUrl();
        return this;
    }

    Graphite.prototype.get = function(key) {
        if (typeof key === 'undefined') {
            return this.options;
        }
        else if (key === 'url') {
            return this.url;
        }
        return this.options[key];
    }

}) (jQuery);
