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
        }
    }

    // Polling method to reload document preview iframe if changed
    window.setInterval(function(){
        if (iframe.hasClass('outdated')) {
            iframe.removeClass('outdated');
            save_document(true);
            iframe[0].contentWindow.location.reload();
        }
    }, 1000);

    $('#document_form').submit(function(){
        save_document(no_refresh);
    });

/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*
 *~*~*~*~*~*~*~*~           Bottom Button Bar       ~*~*~*~*~*~*~*~*~*~*~*~*~*
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

/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*
 *~*~*~*~*~*~*~*~            Top Button Bar         ~*~*~*~*~*~*~*~*~*~*~*~*~*
 *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*/
    function wrap_selection(wrapper, conflicting) {
        var selected = iframe.contents().find('.selected');
        var removing = false;
        var selected_text = selected.text().trim();
        if (selected_text == selected.closest(wrapper).text().trim() ||
                selected_text == selected.find(wrapper).text().trim()) {
            if (DEBUG) console.log('Unwrapping selection...');
            removing = true;
        } else {
            if (DEBUG)
                console.log('Wrapping selected with ' + wrapper + '...');
        }
        selected.each(function(){
            var s = $(this);
            for (var i=0; i<conflicting.length; i++) {
                var conflict = conflicting[i];
                // Unwrap the selection if it isn't destructive to do so
                if (s.closest(conflict).text().trim() == s.text().trim()) {
                    if (DEBUG) console.log('Removing parent conflict...');
                    s.closest(conflict).replaceWith(s.html());
                }
                // Get rid of all conflicts within the selection
                s.find(conflict).each(function(){
                    if (DEBUG) console.log('Removing child conflict...');
                    var s_inner = $(this);
                    s_inner.replaceWith(s_inner.html());
                });
            }
            if (!removing) s.wrap(['<', '></', '>'].join(wrapper));
        });
    }

    var all_headers = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    $('#heading1').click(function(e){
        wrap_selection('h1', all_headers);
    });

    $('button[title="Bold"]').click(function(){
        wrap_selection('strong', ['strong', 'b']);
    });

    $('button[title="Italics"]').click(function(){
        wrap_selection('em', ['em', 'i']);
    });

    $('button[title="Highlight"]').click(function(){
        wrap_selection('mark', ['mark']);
    });

    $('button[title="Strikethrough"]').click(function(){
        wrap_selection('strike', ['strike', 's']);
    });

});
