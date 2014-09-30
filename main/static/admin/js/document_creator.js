var gridster, iframe_reload_timer, polling_loop;
$(document).ready(function(){
    var iframe = $('#preview_iframe');

    function save_document(no_refresh) {
        if (DEBUG) console.log('Checking for updates...');
        /* Loop through each element corresponding to a Component marked
           updated and update its corresponding hidden form element.        */
        iframe.contents().find('.updated[data-object]').each(function(){
            var updated = $(this);
            var elemid = updated.data('object');
            if (DEBUG) console.log('Updating ' + elemid + '...');
            iframe.contents().find('#' + elemid + '-text')
                .addClass('updated')
                .val(updated.html().trim());
            updated.removeClass('updated');
        });
        var text_dict = {};
        var updated = iframe.contents().find('input.updated');
        /* Use any updated form elements to make AJAX calls to update the
           objects themselves in the database.                              */
        if (updated.length) {
            updated.each(function(){
                var elemid = $(this).attr('id').replace('-text', '');
                text_dict[elemid] = this.value;
            });
            if (DEBUG) console.log('Saving elements...');
            $.ajax({
                async: false,
                url: update_url,
                type: 'POST',
                data: text_dict,
                success: function(){
                    iframe.contents().find('input.updated').each(function(){
                        $(this).removeClass('updated');
                    });
                    if (!no_refresh) {
                        if (DEBUG) console.log('Refreshing...');
                        iframe.addClass('outdated');
                    }
                }
            });
        } else {
            if (DEBUG) console.log('No updates found.');
        }
    }

    var prev_page_width = iframe.width();
    function set_bootstrap_page_size(force) {
        var page_width = iframe.width();
        var incremental_adjustment = false;
        if (!force && Math.abs(prev_page_width - page_width) < 20) {
            incremental_adjustment = true;
        }
        prev_page_width = page_width;
        if (!incremental_adjustment) {
            $('#page-size-btn-group .btn-info')
                .removeClass('btn-info').addClass('btn-default');
            if (page_width < 768) {
                $('button[title="Extra Small (Mobile)"]')
                    .removeClass('btn-default').addClass('btn-info');
            } else if (page_width < 992) {
                $('button[title="Small (Tablet)"]')
                    .removeClass('btn-default').addClass('btn-info');
            } else if (page_width < 1200) {
                $('button[title="Medium (Desktop)"]')
                    .removeClass('btn-default').addClass('btn-info');
            } else {
                $('button[title="Large (Widescreen)"]')
                    .removeClass('btn-default').addClass('btn-info');
            }
        }
        return !incremental_adjustment;
    }

    function set_gridster_data() {
        var col_size = $('#page-size-btn-group .btn-info')
                            .text().trim().toLowerCase();
        var rowset = iframe.contents().find('.row');
        rowset.each(function(index) {
            var col_adjust = 0;
            $(this).find('*[data-object]').each(function(){
                var size_class_re = new RegExp('col-'+col_size+'-\d');
                var offset_class_re = new RegExp('col-'+col_size+'-offset-\d');
                var pull_class_re = new RegExp('col-'+col_size+'-pull-\d');
                var push_class_re = new RegExp('col-'+col_size+'-push-\d');
                var size_class = this.className.match(size_class_re);
                var offset_class = this.className.match(offset_class_re);
                var pull_class = this.className.match(pull_class_re);
                var push_class = this.className.match(push_class_re);
                var size = (size_class) ? size_class[0].substr(-1) : 12;
                var offset = (offset_class) ? offset_class[0].substr(-1) : 0;
                var pull = (pull_class) ? pull_class[0].substr(-1) : 0;
                var push = (push_class) ? push_class[0].substr(-1) : 0;
                var self = $(this);
                var innerW = self.innerWidth();
                var innerH = self.innerHeight();
                var margin_horiz = self.outerWidth(true) - self.outerWidth();
                var margin_vert = self.outerHeight(true) - self.outerHeight();
                self
                    .data('row', index + 1)
                    .data('col', col_adjust + offset + 1)
                    .data('sizey', 1)
                    .data('sizex', size)
                    .gridster({
                        widget_base_dimensions: [innerW, innerH],
                        widget_margins: [margin_horiz, margin_vert],
                        draggable: {
                            handle: '#movehandle'
                        }
                    }).data('gridster');
                gridster = this;
                col_adjust += size;
            });
        });
    }

    // Polling method to reload document preview iframe if changed
    window.clearInterval(polling_loop);
    polling_loop = window.setInterval(function(){
        if (iframe.hasClass('outdated')) {
            iframe.removeClass('outdated');
            save_document(true);
            iframe[0].contentWindow.location.reload();
        }
    }, 1000);

    $('#document_form').submit(function(){
        save_document(no_refresh);
    });

    iframe.load(function(){
        set_bootstrap_page_size(true);  // true = force to run (for first load)
        set_gridster_data();
    });
    $(window).on('resize', function(){
        var reset = set_bootstrap_page_size();
        window.clearTimeout(iframe_reload_timer);
        if (reset) {
            iframe_reload_timer = window.setTimeout(function(){
                iframe.addClass('outdated');
            }, 300);
        }
    });

/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*
 *~*~*~*~*~*~*~*~*~*~         Button Bar         *~*~*~*~*~*~*~*~*~*~*~*~*~*~*
 *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*/
    $('button[title="Save"]').click(function(){
        if (original_pk) {
            save_document();
        } else {
            $('input[name="_continue"]').click();
        }
    });

    $('button[title="Desktop Preview"]').click(function(){
        window.open(preview_url);
    });

    $('button[title="Mobile Preview"]').click(function(){
        iframe.toggleClass('mobile');
    });

    $('button[title="Print"]').click(function(){
        window.open(preview_url + '?print=1');
    });

    var screen_width = window.screen.availWidth;
    if (screen_width < 1200) {
        $('button[title="Large (Widescreen)"]').prop('disabled', true);
    } else if (screen_width < 992) {
        $('button[title="Medium (Desktop)"]').prop('disabled', true);
    } else if (screen_width < 768) {
        $('button[title="Small (Tablet)"]').prop('disabled', true);
    }
});
