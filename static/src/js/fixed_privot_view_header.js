odoo.define('max_web_freeze_Pivot_View_header', function (require) {
'use strict';
    var PivotView = require('web.PivotView');
    PivotView.include({

        on_field_menu_selection: function () {
            event.preventDefault();
            var field = $(event.target).parent().data('field'),
                interval = $(event.target).data('interval'),
                header = this.headers[this.last_header_selected];
            if (interval) field = field + ':' + interval;
            this.expand_header(header, field)
                .then(function () {
                    header.root.groupbys.push(field);
                })
                .then(this.proxy('display_table'))
                .then(this.proxy('do_show'));
        },

        do_show: function () {
            var self = this;
            return this._super.apply(this, arguments).done(function () {
                // var form_field_length = self.$el.parents('.o_form_field').length;
                // console.log('form_field_length = ',form_field_length)
                var scrollArea = $(".o_content")[0];
                function do_freeze () {
                    self.$el.find('table.table-bordered').each(function () {
                        $(this).pivotTableFirstCol({scrollableArea: scrollArea, fixedOffset: 0.1});
                        $(this).pivotTableHeaders({scrollableArea: scrollArea, fixedOffset: 0.1});
                    });
                }
                do_freeze()
            });
        },

        expand_all: function () {
            this.load_data(false).then(this.proxy('display_table')).then(this.proxy('do_show'));
        },
        flip: function () {
            var temp = this.main_col;
            this.main_col = this.main_row;
            this.main_row = temp;
            this.display_table();
            this.do_show();
        },
    })



});
