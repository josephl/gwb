Views = window.Views || {};

(function($) {

    /* Main Plot */
    Views.MainPlot = Backbone.View.extend({
        tagName: 'div',
        className: 'main graph widget span9',
        flotOptions: new Options.FlotMain(),
        initialize: function() {
            //this.flotOptions = new Options.FlotMain();
            this.listenTo(this.model, 'updateMain', this.render);
        },
        render: function() {
            var data = this.model.get('mainData');
            this.plot = $.plot(this.$el, data, this.flotOptions.toJSON());
            // set colors back to models
            this.model.set('colors', this.plot.getOptions().colors);
            return this;
        },
        events: {
            'plotselected': 'plotselected'
        },
        // set time range, re-request
        plotselected: function(e, ranges) {
            var options = this.model.get('options');
            options.from = parseInt(ranges.xaxis.from / 1000);
            options.until = parseInt(ranges.xaxis.to / 1000);
            console.log(this.model.get('options'));
            this.model.requestMain();
        }
    });


    /* Range Plot */
    Views.RangePlot = Backbone.View.extend({
        tagName: 'div',
        className: 'range graph widget span9',
        flotOptions: new Options.FlotRange(),
        initialize: function() {
            this.listenTo(this.model, 'updateRange', this.render);
        },
        render: function() {
            var data = this.model.get('rangeData');
            this.plot = $.plot(this.$el, data, this.flotOptions.toJSON());
            return this;
        },
        events: {
            'plotselected': 'plotselected',
            'plotunselected': 'plotunselected'
        },
        // set time range, re-request model's main
        plotselected: function(e, ranges) {
            var options = this.model.get('options');
            options.from = parseInt(ranges.xaxis.from / 1000);
            options.until = parseInt(ranges.xaxis.to / 1000);
            console.log(this.model.get('options'));
            this.model.requestMain();
        },
        // de-select range graph, reset main to default time interval
        plotunselected: function() {
            var options = this.model.get('options');
            delete options.from;
            delete options.until;
            this.model.requestMain();
        }
    });


    /* Pie Graph */
    Views.PieGraph = Backbone.View.extend({
        tagName: 'div',
        className: 'pie graph span3',
        flotOptions: new Options.FlotPie(),
        initialize: function() {
            this.listenTo(this.model, 'updateStats', this.render);
        },
        render: function() {
            console.log('pie');
            var stats = this.model.get('mainStats');
            var data = _.map(stats, function(s) {
                return {
                    data: s.sum,
                    label: ''
                };
            });
            if (data.length > 1) {
                this.$el.css('display', 'inline');
                this.plot = $.plot(this.$el, data, this.flotOptions.toJSON()); 
            }
            else {
                this.$el.css('display', 'none');
            }
            return this;
        },
        events: {
            'plotclick': 'plotclick'
        },
        plotclick: function(e, pos, obj) {
            if (this.model.get('selected') === obj.seriesIndex) {
                console.log('unselected');
                this.model.unset('selected');
            }
            else {
                console.log('selected: ' + obj.seriesIndex);
                this.model.set('selected', obj.seriesIndex);
            }
        }
    });


    /* Stats Panel */
    Views.StatsPanel = Backbone.View.extend({
        tagName: 'div',
        className: 'stats panel span3',
        initialize: function() {
            // Assigned colors occurs after MainPlot chooses and selects them
            this.model.on('change:colors', this.render, this);
            // subscribe to changes to selection, re-render
            this.model.on('change:selected', this.render, this);
        },
        render: function(data) {
            console.log('render stats');
            this.$el.empty();
            var stats = this.model.get('mainStats');
            var mainData = this.model.get('mainData');
            var colors = this.model.get('colors');
            for (var i = 0; i < stats.length; i++) {
                var curStat = $('<ul>');
                var colorbox = $('<div>')
                    .attr('class', 'color-box')
                    .css('background-color', colors[i]);
                curStat.append(colorbox)
                    .append('<a>' + mainData[i].label + '</a>');
                if (this.model.get('selected') === i) {
                    var freq = stats[i].freq,
                        mean = parseFloat(stats[i].mean).toFixed(2),
                        median = parseFloat(stats[i].quartile[1]).toFixed(2),
                        variance = parseFloat(stats[i].var).toFixed(2);
                    curStat.append('<li>Frequency: ' + freq + '</li>')
                        .append('<li>Mean: ' + mean + '</li>')
                        .append('<li>Median: ' + median + '</li>')
                        .append('<li>Variance: ' + variance + '</li>');
                }
                this.$el.append(curStat);
            }
            return this;
        },
        events: {
            'click a': 'selected'
        },
        // metric label selected from stats panel
        selected: function(e) {
            var target = e.target.text;
            var mainData = this.model.get('mainData');
            for (var i = 0; i < mainData.length; i++) {
                if (target === mainData[i].label) {
                    if (this.model.get('selected') === i) {
                        console.log('unselected: ' + target);
                        this.model.unset('selected');
                    }
                    else {
                        console.log('selected: ' + target);
                        this.model.set('selected', i);
                    }
                    break;
                }
            }
        }
    });


    /* Input Field - metric target name */
    Views.InputTarget = Backbone.View.extend({
        tagName: 'input',
        className: 'target',
        initialize: function() {
            var that = this;
            this.$el.keypress(function(e) {
                if (e.which == 13) {
                    // parse target metric names
                    var rawTargets = that.$el.val();
                    that.model.get('options').target = _.map(
                        rawTargets.split(','),
                        function(t) { return t.trim(); });
                    that.model.request();
                }
            });
        },
        events: {
            'focus': 'focus',
            'blur': 'blur'
        },
        focus: function() {
            this.$el.css('border-bottom-color', '#222');
        },
        blur: function() {
            this.$el.css('border-bottom-color', '');
        }
    });


    /* Resample Frequency Toggle */
    Views.FreqToggle = Backbone.View.extend({
        tagName: 'div',
        className: 'freq',
        initialize: function() {
            var inputs = $('<input type="checkbox" id="freq1" value="D" />' +
                           '<label for="freq1">Day</label>' +
                           '<input type="checkbox" id="freq2" value="H" />' +
                           '<label for="freq2">Hour</label>' +
                           '<input type="checkbox" id="freq3" value="T" />' +
                           '<label for="freq3">Minute</label>');
            this.$el.append(inputs);
            this.$el.buttonset();
        },
        events: {
            'click input': 'checked'
        },
        checked: function(e) {
            var inputs = $('input', this.$el);
            if ($(e.target).attr('checked') === 'checked') {
                // remove all other checks
                for (var i = 0; i < inputs.length; i++) {
                    if (e.target !== inputs[i]) {
                        $(inputs[i]).attr('checked', false);
                    }
                }
                this.$el.buttonset('refresh');
                this.model.get('options').resampleFreq = $(e.target).val();
                this.model.requestMain();
            }
            else {
                console.log('unchecked');
                delete this.model.get('options').resampleFreq;
                this.model.requestMain();
            }
        }
    });
    

    /* Widget View
     * Top-level container */
    Views.Widget = Backbone.View.extend({
        tagName: 'div',
        className: 'widget container',
        //template: _.template($('#widget-template').html()),
        initialize: function() {
            console.log('Widget');
            $('body').append(this.$el);
            var model = { model: this.model };
            this.target = new Views.InputTarget(model);
            this.frequency = new Views.FreqToggle(model);
            this.mainPlot = new Views.MainPlot(model);
            this.rangePlot = new Views.RangePlot(model);
            this.pieGraph = new Views.PieGraph(model);
            this.statsPanel = new Views.StatsPanel(model);
            this.model.request();
        },
        render: function() {
            this.$el.append(this.target.$el);
            this.$el.append(this.frequency.$el);
            this.$el.append(this.mainPlot.$el);
            this.$el.append(this.rangePlot.$el);
            this.$el.append(this.pieGraph.$el);
            this.$el.append(this.statsPanel.$el);
            //this.subviews = {
            //    target: this.target.$el.html(),
            //    frequency: this.frequency.$el.html(),
            //    mainPlot: this.mainPlot.$el.html(),
            //    rangePlot: this.rangePlot.$el.html(),
            //    pieGraph: this.pieGraph.$el.html(),
            //    statsPanel: this.statsPanel.$el.html()
            //};
            //this.$el.html(this.template(this.subviews));
            return this;
        }
    });
})(jQuery);
