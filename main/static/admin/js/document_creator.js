var iframe_reload_timer, polling_loop;
$(document).ready(function(){
    var iframe = $('#preview_iframe');

    var SAVE_BLACKLIST = [
        '#action_button_bar'
    ];

    function save_document(no_refresh) {
        if (DEBUG) console.log('Checking for updates...');
        /* Remove blacklisted elements which should not be saved. */
        for (var i=0; i<SAVE_BLACKLIST.length; i++)
            iframe.contents().find(SAVE_BLACKLIST[i]).remove();
        /* Loop through each element corresponding to a Component marked
           updated and update its corresponding hidden form element.        */
        iframe.contents().find('.updated[data-object]').each(function(){
            var updated = $(this);
            var elemid = updated.data('object');
            if (DEBUG) console.log('Updating ' + elemid + '...');
            updated.find(':empty').remove();
            iframe.contents().find('#' + elemid + '-text')
                .addClass('updated')
                .val(updated.html().trim());
            updated.removeClass('updated');
        });
        var data_dict = {};
        var updated = iframe.contents().find('input.updated');
        /* Use any updated form elements to make AJAX calls to update the
           objects themselves in the database.                              */
        var col_sizes = ['col_xs', 'col_sm', 'col_md', 'col_lg'];
        var suffixes = ['', '_offset', '_pull', '_push'];
        if (updated.length) {
            updated.each(function(){
                var self = $(this);
                var elemid = self.attr('id').replace('-text', '');
                var iframe_data = iframe[0].contentWindow.$.data;
                if (iframe_data(this, 'remove')) {
                    data_dict[elemid+'-remove'] = true;
                } else {
                    data_dict[elemid+'-text'] = this.value;
                    for (var i=0; i<4; i++){
                        for (var j=0; j<4; j++) {
                            var attr = col_sizes[j]+suffixes[i];
                            var data = iframe_data(this, attr);
                            if (data)
                                data_dict[elemid+'-'+attr] = data;
                        }
                    }
                    var data = iframe_data(this, 'row');
                    if (data)
                        data_dict[elemid+'-row'] = data;
                }
            });
            if (DEBUG) console.log('Saving elements...');
            $.ajax({
                async: false,
                url: update_url,
                type: 'POST',
                data: data_dict,
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

    // Polling method to reload document preview iframe if changed
    window.clearInterval(polling_loop);
    polling_loop = window.setInterval(function(){
        if (iframe.hasClass('outdated')) {
            iframe.removeClass('outdated');
            save_document(true);        // save without refresh
            iframe[0].contentWindow.location.reload();
        }
    }, 1000);

    $('#document_form').submit(function(){
        save_document(true);            // save without refresh
    });

    iframe.load(function(){
        set_bootstrap_page_size(true);  // force=true (first run)
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

    var screen_width = window.screen.availWidth;
    if (screen_width < 1200) {
        $('button[title="Large (Widescreen)"]').prop('disabled', true);
    } else if (screen_width < 992) {
        $('button[title="Medium (Desktop)"]').prop('disabled', true);
    } else if (screen_width < 768) {
        $('button[title="Small (Tablet)"]').prop('disabled', true);
    }

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
});
