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
