/*! Copyright (c) 2011 by Jonas Mosbech - https://github.com/jmosbech/StickyTableHeaders
	MIT license info: https://github.com/jmosbech/StickyTableHeaders/blob/master/license.txt */

;(function ($, window, undefined) {
    'use strict';

    var name = 'pivotTableFirstCol',

        id = 0,
        defaults = {
            fixedOffset: 0,
            leftOffset: 0,
            // marginTop: 0,
            objDocument: document,
            objHead: 'head',
            objWindow: window,
            scrollableArea: window,
            cacheFirstColHeight: false,
        };
    function Plugin(el, options) {
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        base.id = id++;
        // Listen for destroyed, call teardown
        base.$el.bind('destroyed',
            $.proxy(base.teardown, base));

        // Cache DOM refs for performance reasons
        base.$clonedFirstCol = null;
        base.$originalFirstCol = null;

        // Cache header height for performance reasons
        base.cachedFirstColHeight = null;

        // Keep track of state
        base.isSticky = false;
        base.hasBeenSticky = false;
        base.leftOffset = null;
        // base.topOffset = null;

        base.init = function () {
            base.setOptions(options);

            base.$el.each(function () {
                var $this = $(this);

                // remove padding on <table> to fix issue #7
                $this.css('padding', 0);

                base.$originalFirstCol = $('tbody tr td:first-child', this);


                // $(".o_pivot")[0].style.cssText="color:red;";
                // base.$scrollableArea.getElementsByClassName('o_pivot').style.color='red';

                base.$clonedFirstCol = base.$originalFirstCol.clone();
                $this.trigger('clonedFirstCol.' + name, [base.$clonedFirstCol]);

                base.$clonedFirstCol.addClass('tableFloatingFirstCol');
                // base.$clonedFirstCol.css({display: 'none', opacity: 0.0});
                base.$clonedFirstCol.css({position: 'static', opacity: 1});

                base.$originalFirstCol.addClass('tableFloatingFirstColOriginal');
                base.$originalFirstCol.css({position:'absolute'});


                base.$originalFirstCol.after(base.$clonedFirstCol);

                base.$printStyle = $('<style type="text/css" media="print">' +
                    // '.tableFloatingFirstCol{display:none !important;}' +
                    // '.tableFloatingFirstColOriginal{position:static !important;}' +
                    '</style>');
                base.$head.append(base.$printStyle);
            });

            base.updateWidth();
            base.toggleFirstCols();
            base.bind();
        };

        base.destroy = function () {

            base.$el.unbind('destroyed', base.teardown);
            base.teardown();
        };

        base.teardown = function () {
            if (base.isSticky) {
                base.$originalFirstCol.css('position', 'static');
            }
            $.removeData(base.el, 'plugin_' + name);
            base.unbind();

            base.$clonedFirstCol.remove();
            base.$originalFirstCol.removeClass('tableFloatingFirstColOriginal');
            base.$originalFirstCol.css('visibility', 'visible');
            base.$printStyle.remove();

            base.el = null;
            base.$el = null;
        };
        base.moveLeft = function (event) {
            $(base.$scrollableArea).find('.o_pivot').css({overflow:"visible"});


            if (event.offsetX > 0) {
                base.$el.each(function () {
                    var $this = $(this),
                        offset = $this.offset()
                    // base.$el.find('.tableFloatingFirstColOriginal').css("left", (offset.left*-1) + "px")
                })
            }
        };


        base.bind = function () {
            base.$scrollableArea.on('scroll.' + name, base.toggleFirstCols);
            base.$el.on('mousewheel', base.moveLeft);
            base.$el.mouseenter(base.moveLeft);
            // base.$el.on('mousemove.drag' + name, base.moveLeft);

            /*if (!base.isWindowScrolling) {
                base.$window.on('scroll.' + name + base.id, base.setPositionValues);
                base.$window.on('resize.' + name + base.id, base.toggleFirstCols);
            }
            base.$scrollableArea.on('resize.' + name, base.toggleFirstCols);
            base.$scrollableArea.on('resize.' + name, base.updateWidth);*/
        };

        base.unbind = function () {
            // unbind window events by specifying handle so we don't remove too much
            base.$scrollableArea.off('.' + name, base.toggleFirstCols);
            if (!base.isWindowScrolling) {
                base.$window.off('.' + name + base.id, base.setPositionValues);
                base.$window.off('.' + name + base.id, base.toggleFirstCols);
            }
            base.$scrollableArea.off('.' + name, base.updateWidth);
        };

        // We debounce the functions bound to the scroll and resize events
        base.debounce = function (fn, delay) {
            var timer = null;
            return function () {
                var context = this, args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    fn.apply(context, args);
                }, delay);
            };
        };


        base.toggleFirstCols = base.debounce(function () {
            if (base.$el) {
                base.$el.each(function () {
                    var $this = $(this),
                        newLeft,
                        // newTopOffset = base.isWindowScrolling ? (
                        //         isNaN(base.options.fixedOffset) ?
                        //             base.options.fixedOffset.outerHeight() :
                        //             base.options.fixedOffset
                        //     ) :
                        //     base.$scrollableArea.offset().top + (!isNaN(base.options.fixedOffset) ? base.options.fixedOffset : 0),
                        offset = $this.offset(),
                        // scrollTop = base.$scrollableArea.scrollTop() + newTopOffset,
                        scrollLeft = base.$scrollableArea.scrollLeft(),
                        // FirstColHeight = base.options.cacheFirstColHeight ? base.cachedFirstColHeight : base.$clonedFirstCol.height(),
                        // scrolledPastTop = base.isWindowScrolling ?
                        //     scrollTop > offset.top :
                        //     newTopOffset > offset.top,
                        // notScrolledPastBottom = (base.isWindowScrolling ? scrollTop : 0) <
                        //     (offset.top + $this.height() - headerHeight - (base.isWindowScrolling ? 0 : newTopOffset));
                        notScrolledPastBottom = (base.isWindowScrolling ? scrollTop : 0) <
                            (offset.top + $this.height()  - (base.isWindowScrolling ? 0 : 0));

                    if ( notScrolledPastBottom) {
                        newLeft = offset.left - scrollLeft + base.options.leftOffset;
                        base.$originalFirstCol.css({
                            'position': 'fixed',
                            // 'margin-top': base.options.marginTop,
                            // 'left': newLeft,
                            // 'left': -offset.left,
                            // 'z-index': 3 // #18: opacity bug
                        });
                        base.leftOffset = newLeft;
                        // base.topOffset = newTopOffset;
                        // base.$clonedFirstCol.css('display', '');
                        if (!base.isSticky) {
                            base.isSticky = true;
                            // make sure the width is correct: the user might have resized the browser while in static mode
                            // base.updateWidth();
                            $this.trigger('enabledStickiness.' + name);
                        }
                        // base.setPositionValues();
                    } else if (base.isSticky) {
                        base.$originalFirstCol.css('position', 'relative');
                        // base.$clonedFirstCol.css('display', 'none');
                        base.isSticky = false;
                        // base.resetWidth($('td,th', base.$clonedFirstCol), $('td,th', base.$originalFirstCol));
                        // base.resetWidth($('td,th', base.$originalFirstCol));
                        $this.trigger('disabledStickiness.' + name);
                    }
                });
            }
        }, 50);

        base.setPositionValues = base.debounce(function () {
            var winScrollTop = base.$window.scrollTop(),
                winScrollLeft = base.$window.scrollLeft();

            if (!base.isSticky ||
                winScrollTop < 0 || winScrollTop + base.$window.height() > base.$document.height() ||
                winScrollLeft < 0 || winScrollLeft + base.$window.width() > base.$document.width()) {
                return;
            }
            base.$originalFirstCol.css({
                // 'top': base.topOffset - (base.isWindowScrolling ? 0 : winScrollTop),
                // 'left': base.leftOffset - (base.isWindowScrolling ? 0 : winScrollLeft)
                'left': base.$scrollableArea.scrollLeft()
            });
        }, 10000);

        base.updateWidth = base.debounce(function () {
            if (!base.isSticky) {
                return;
            }
            // Copy cell widths from clone
            if (!base.$originalFirstColCells) {
                base.$originalFirstColCells = $('th,td', base.$originalFirstCol);
            }
            // if (!base.$clonedFirstColCells) {
            //     base.$clonedFirstColCells = $('th,td', base.$clonedFirstCol);
            // }
            // var cellWidths = base.getWidth(base.$clonedFirstColCells);
            // base.setWidth(cellWidths, base.$clonedFirstColCells, base.$originalFirstColCells);

            // Copy row width from whole table
            // base.$originalFirstCol.css('width', base.$clonedFirstCol.width());

            // If we're caching the height, we need to update the cached value when the width changes
            // if (base.options.cacheFirstColHeight) {
            //     base.cachedFirstColHeight = base.$clonedFirstCol.height();
            // }
        }, 0);

        base.getWidth = function ($clonedFirstCols) {
            var widths = [];
            $clonedFirstCols.each(function (index) {
                var width, $this = $(this);

                if ($this.css('box-sizing') === 'border-box') {
                    var boundingClientRect = $this[0].getBoundingClientRect();
                    if (boundingClientRect.width) {
                        width = boundingClientRect.width; // #39: border-box bug
                    } else {
                        width = boundingClientRect.right - boundingClientRect.left; // ie8 bug: getBoundingClientRect() does not have a width property
                    }
                } else {
                    var $origTh = $('th', base.$originalFirstCol);
                    if ($origTh.css('border-collapse') === 'collapse') {
                        if (window.getComputedStyle) {
                            width = parseFloat(window.getComputedStyle(this, null).width);
                        } else {
                            // ie8 only
                            var leftPadding = parseFloat($this.css('padding-left'));
                            var rightPadding = parseFloat($this.css('padding-right'));
                            // Needs more investigation - this is assuming constant border around this cell and it's neighbours.
                            var border = parseFloat($this.css('border-width'));
                            width = $this.outerWidth() - leftPadding - rightPadding - border;
                        }
                    } else {
                        width = $this.width();
                    }
                }

                widths[index] = width;
            });
            return widths;
        };

        base.setWidth = function (widths, $clonedFirstCols, $origFirstCols) {
            $clonedFirstCols.each(function (index) {
                var width = widths[index];
                $origFirstCols.eq(index).css({
                    'min-width': width,
                    'max-width': width
                });
            });
        };

        base.resetWidth = function ($clonedFirstCols, $origFirstCols) {
            $clonedFirstCols.each(function (index) {
                var $this = $(this);
                $origFirstCols.eq(index).css({
                    'min-width': $this.css('min-width'),
                    'max-width': $this.css('max-width')
                });
            });
        };

        base.setOptions = function (options) {
            base.options = $.extend({}, defaults, options);
            base.$window = $(base.options.objWindow);
            base.$head = $(base.options.objHead);
            base.$document = $(base.options.objDocument);
            base.$scrollableArea = $(base.options.scrollableArea);
            base.isWindowScrolling = base.$scrollableArea[0] === base.$window[0];
        };

        base.updateOptions = function (options) {
            base.setOptions(options);
            // scrollableArea might have changed
            base.unbind();
            base.bind();
            // base.updateWidth();
            // base.toggleFirstCols();
        };

        // Run initializer
        base.init();
    }

    // A plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[name] = function (options) {
        return this.each(function () {
            var instance = $.data(this, 'plugin_' + name);
            if (instance) {
                if (typeof options === 'string') {
                    instance[options].apply(instance);
                } else {
                    instance.updateOptions(options);
                }
            } else if (options !== 'destroy') {
                $.data(this, 'plugin_' + name, new Plugin(this, options));
            }
        });
    };

})(jQuery, window);
