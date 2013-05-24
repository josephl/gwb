Views = window.Views || {};

(function($) {

    /* Main Plot */
    Views.MainPlot = Backbone.View.extend({
        tagName: 'div',
        className: 'main graph widget span9',
        flotOptions: new Options.FlotMain(),
        initialize: function() {
            //this.flotOptions = new Options.FlotMain();
            //this.listenTo(this.model, 'updateMain', this.render);
            this.model.on('change:mainData', this.render, this);
        },
        render: function() {
            var data = this.model.get('mainData');
            var colors;
            if (data !== null) {
                this.$el.show();
                this.plot = $.plot(this.$el, data, this.flotOptions.toJSON());
                // set colors back to models, unless they already exist,
                // are unchanged, and labels are the same
                // change:colors invokes StatsPanel object to render
                colors = this.plot.getOptions().colors;
                this.model.set('colors', colors);
            }
            else {
                this.$el.hide();
            }
            return this;
        },
        events: {
            'plotselected': 'plotselected'
        },
        // set time range, re-request
        plotselected: function(e, ranges) {
            var options = this.model.get('options').get('data');
            options.from = parseInt(ranges.xaxis.from / 1000);
            options.until = parseInt(ranges.xaxis.to / 1000);
            console.log(this.model.get('options'));
            this.model.fetch(false);
        },
    });


    /* Range Plot */
    Views.RangePlot = Backbone.View.extend({
        tagName: 'div',
        className: 'range graph widget span9',
        flotOptions: new Options.FlotRange(),
        initialize: function() {
            //this.listenTo(this.model, 'updateRange', this.render);
           this.model.on('change:rangeData', this.render, this);
        },
        render: function() {
            var data = this.model.get('rangeData');
            if (data !== null) {
                this.$el.show();
                this.plot = $.plot(this.$el, data, this.flotOptions.toJSON());
            }
            else {
                this.$el.hide();
            }
            return this;
        },
        events: {
            'plotselected': 'plotselected',
            'plotunselected': 'plotunselected'
        },
        // set time range, re-request model's main
        plotselected: function(e, ranges) {
            var options = this.model.get('options').get('data');
            options.from = parseInt(ranges.xaxis.from / 1000);
            options.until = parseInt(ranges.xaxis.to / 1000);
            console.log(this.model.get('options'));
            this.model.fetch(false);
        },
        // de-select range graph, reset main to default time interval
        plotunselected: function() {
            var options = this.model.get('options').get('data');
            delete options.from;
            delete options.until;
            this.model.fetch(false);
        }
    });


    /* Pie Graph */
    Views.PieGraph = Backbone.View.extend({
        tagName: 'div',
        className: 'pie graph span3',
        flotOptions: new Options.FlotPie(),
        initialize: function() {
           this.model.on('change:mainStats', this.render, this);
        },
        render: function() {
            console.log('pie');
            var stats = this.model.get('mainStats');
            if (stats !== null) {
                var data = _.map(stats, function(s) {
                    return {
                        data: s.sum,
                        label: ''
                    };
                });
                if (data.length > 1) {
                    this.$el.show();
                    this.plot = $.plot(this.$el, data, this.flotOptions.toJSON()); 
                }
                else {
                    this.$el.hide();
                }
            }
            else {
                this.$el.hide();
            }
            return this;
        },
        events: {
            'plotclick': 'plotclick'
        },
        plotclick: function(e, pos, obj) {
            this.trigger('selected', obj.seriesIndex);
        }
    });


    /* Stats Panel */
    Views.StatsPanel = Backbone.View.extend({
        tagName: 'div',
        className: 'stats panel',
        template: _.template($('#stat-template').html()),
        initialize: function() {
            // Assigned colors occurs after MainPlot chooses and selects them
            //this.model.on('change:colors', this.render, this);
            this.model.on('change:mainStats', this.render, this);
            this.model.on('change:colors', this.colorize, this);
            this.$el.accordion({
                collapsible: true,
                active: false,
                icons: false
            });
        },
        render: function() {
            console.log('render stats');
            this.$el.empty();
            var stats = $.extend(true, [], this.model.get('mainStats'));
            var mainData = this.model.get('mainData');
            var colors = this.model.get('colors');
            for (var i = 0; i < stats.length; i++) {
                stats[i].label = mainData[i].label;
                stats[i].index = i;
                this.$el.append(this.template(stats[i]));
                // add selected metric options
            }
            //$('.isolate-button', this.$el).button();
            $('.stat-button', this.$el).button();
            this.$el.accordion({ animate: false });
            this.$el.accordion('refresh')
                .accordion({
                    active: false,
                    animate: true
                });
            /* if colors are ready */
            if (typeof colors !== 'undefined') {
                this.colorize();
            }
            return this;
        },
        events: {
            'click .isolate-button': 'isolate',
            'click .analyze-button': 'analyze'
        },
        colorize: function() {
            var boxen = $('.color-box', this.$el);
            var colors = this.model.get('colors');
            for (var i = 0; i < boxen.length; i++) {
                $(boxen[i]).css('background-color', colors[i]);
            }
        },
        // activate: the other selected. triggered from outside views
        activate: function(index) {
            var current = this.$el.accordion('option', 'active');
            this.$el.accordion({
                active: current === index ? false : index
            });
        },
        isolate: function(e) {
            var mainData = this.model.get('mainData');
            var index = this.$el.accordion('option', 'active');
            if (e.target.checked === true) {
                console.log(index);
                mainData[index].yaxis = 2;
            }
            else {
                delete mainData[index].yaxis;
            }
            this.trigger('isolate', index);
        },
        analyze: function(e) {
            //var mainData = this.model.get('mainData');
            var index = this.$el.accordion('option', 'active');
            this.trigger('analyze', index);
        }
    });


    /* Input Field - metric target name */
    Views.InputTarget = Backbone.View.extend({
        tagName: 'input',
        className: 'target',
        initialize: function() {
            this.$el.val(this.getTargets());
            var that = this;
            this.$el.keypress(function(e) {
                if (e.which == 13) {
                    // parse target metric names
                    var rawTargets = that.$el.val();
                    console.log(rawTargets);
                    that.model.get('options').get('data').target = _.map(
                        rawTargets.split(','),
                        function(t) { return t.trim(); });
                    that.model.fetch();
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
        },
        getTargets: function() {
            var tarList = this.model.get('options').get('data').target;
            var tarStr = tarList.join(', ');
            if (tarStr.length == 0) {
                return 'Metric Target';
            }
            return tarStr;
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
                           '<label for="freq2">Hour</label>');
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
                this.model.get('options').get('data').resampleFreq =
                    $(e.target).val();
                this.model.fetch(false);
            }
            else {
                console.log('unchecked');
                delete this.model.get('options').get('data').resampleFreq;
                this.model.fetch(false);
            }
        }
    });

    /* DayRange Selector
     * Select specific hours within the day */
    Views.DayRange = Backbone.View.extend({
        tagName: 'div',
        className: 'dayrange selectable span9',
        initialize: function() {
            this.$el.selectable({
                filter: '.hour'
            });
            this.hours = [];
        },
        events: {
            'selectablestart': 'start',
            'selectablestop': 'stop',
            'selectableselected': 'selected'
        },
        start: function(e, ui) {
            this.hours = [];
            this.dayStart = e.toElement.id;
            console.log(this.dayStart);
        },
        stop: function(e, ui) {
            var options = this.model.get('options').get('data');
            console.log(this.hours);
            // determine if forward-selected
            if (this.dayStart == this.hours[0]) {
                if (this.hours.length <= 1) {
                    console.log('clear');
                    $('.hour.ui-selected', this.$el).removeClass('ui-selected');
                    delete options.dayStart;
                    delete options.dayEnd;
                }
                else {
                    options.dayStart = this.hours[0];
                    options.dayEnd = _.last(this.hours);
                    $(_.last($('.hour.ui-selected'))).removeClass('ui-selected');
                }
            }
            else {
                // backward-selected, exclusive
                options.dayStart = _.last(this.hours);
                options.dayEnd = this.hours[0];
                // set ui-selected
                this.hours.pop(-1);
                console.log(this.hours);;
                console.log(_.range(0, 24));
                this.hours = _.difference(_.range(0, 24), this.hours);
                console.log(this.hours);
                $('.ui-selected', this.$el).removeClass('ui-selected');
                for (var i = 0; i < this.hours.length; i++) {
                    var hour = $('.hour#' + this.hours[i], this.$el);
                    console.log(hour);
                    $('.hour#' + this.hours[i], this.$el).addClass('ui-selected');
                }
            }
            this.model.fetch();
        },
        selected: function(e, ui) {
            this.hours.push(parseInt(ui.selected.id));
        }
    });


    /* Widget View
     * Top-level container */
    Views.Widget = Backbone.View.extend({
        tagName: 'div',
        className: 'widget container',
        template: _.template($('#widget-template').html()),
        initialize: function() {
            console.log('Widget');
            $('body').append(this.$el);
            this.$el.html(this.template());
            this.target = new Views.InputTarget({
                el: $('input.target', this.$el),
                model: this.model
            });
            this.frequency = new Views.FreqToggle({
                el: $('.freq', this.$el),
                model: this.model
            });
            this.mainPlot = new Views.MainPlot({
                el: $('.main.graph', this.$el),
                model: this.model
            });
            this.rangePlot = new Views.RangePlot({
                el: $('.range.graph', this.$el),
                model: this.model
            });
            this.pieGraph = new Views.PieGraph({
                el: $('.pie.graph', this.$el),
                model: this.model
            });
            this.statsPanel = new Views.StatsPanel({
                el: $('.stats.panel', this.$el),
                model: this.model
            });
            this.dayRange = new Views.DayRange({
                el: $('.selectable.dayrange', this.$el),
                model: this.model
            });
            /* event handlers */
            this.listenTo(this.pieGraph, 'selected', this.selected);
            this.listenTo(this.statsPanel, 'isolate', this.isolate);
            this.listenTo(this.statsPanel, 'analyze', this.analyze);
            //this.frequency.render();
            this.model.fetch();
        },
        render: function() {
            this.target.$el.show();
            this.frequency.$el.show();
            this.mainPlot.$el.show();
            this.rangePlot.$el.show();
            this.pieGraph.$el.show();
            this.statsPanel.$el.show();
            return this;
        },
        hideall: function() {
            this.target.$el.hide();
            this.frequency.$el.hide();
            this.mainPlot.$el.hide();
            this.rangePlot.$el.hide();
            this.pieGraph.$el.hide();
            this.statsPanel.$el.hide();
        },
        selected: function(index) {
            this.statsPanel.activate(index);
        },
        isolate: function(index) {
            this.mainPlot.render();
        },
        analyze: function(index) {
            var target = this.model.get('mainData')[index].label;
            var options = this.model.get('options');
            console.log(target);
            console.log(options);
            this.analyzeModel = new Models.Dataset();
            this.analyzeModel.get('options').get('data').target =
                this.analyzeTargets(target);
            this.analyzeChild = new Views.Widget({
                model: this.analyzeModel
            });
            var that = this;
            this.analyzeChild.$el.dialog({
                modal: true,
                resizable: false,
                draggable: true,
                height: parseInt(this.$el.css('height')),
                width: parseInt(this.$el.css('width'))
            });
        },
        analyzeTargets: function(target) {
            return [
                target,
                'holtWintersForecast(' + target + ')',
                'holtWintersAberration(' + target + ')'
            ];
        }
    });
})(jQuery);
