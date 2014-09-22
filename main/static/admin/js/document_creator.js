$(document).ready(function(){
    var iframe = $('#preview_iframe');

    function save_document(no_refresh) {
        if (DEBUG) console.log('Checking for updates...');
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
        var updated = selected.closest('*[data-object]').addClass('updated');
        var already_wrapped = '';
        if (DEBUG) {
            console.log('Applying <'+wrapper+'> to selection...');
            console.log('Conflicting elements: '+conflicting.join(', '));
        }
        selected.each(function(){
            var s = $(this);
            for (var i=0; i<conflicting.length; i++) {
                var conflict = conflicting[i];
                if (this.parentNode.nodeName === conflict.toUpperCase()) {
                    if (DEBUG)
                        console.log('Removing conflicting element '+conflict);
                    already_wrapped += s.text();
                    var conflicted = s.find(conflict);
                    conflicted.replaceWith(conflicted.html());
                }
            }
        });
        if (already_wrapped.trim() == selected.text().trim()){ 
            // all wrapped
            if (DEBUG) console.log('Selection already wrapped... unwrapping');
            selected.each(function(){
                var s = $(this);
                s.unwrap();
            });
        } else {
            // none wrapped
            if (DEBUG) console.log('Selection clean... wrapping');
            selected.each(function(){
                var s = $(this);
                s.html('<'+wrapper+'>'+s.html()+'</'+wrapper+'>');
            });
        }
        updated.find(wrapper).each(function(){
            var el = $(this);
            var next = el.next();
            if (next[0] && next[0].nodeName === wrapper.toUpperCase()) {
                el.html([el.html(), next.remove().html()].join(' '));
            }
        });
    }

    var all_headers = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    $('#heading1').click(function(e){
        if (rangy.getSelection(iframe[0]).toString().length) {
            wrap_selection('h1', all_headers);
        } else {
            // I don't know yet
        }
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
