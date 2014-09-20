$(document).ready(function(){
    var iframe = $('#preview_iframe');

    function save_document(no_refresh) {
        console.log('Checking for updates...');
        iframe.contents().find('.updated[data-object]').each(function(){
            var updated = $(this);
            var elemid = updated.data('object');
            console.log('Updating ' + elemid + '...');
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
            console.log('Saving elements...');
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
                        console.log('Refreshing...');
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
    function wrapSelection(wrapper) {
        var selected = iframe.contents().find('.selected');
        var updated = selected.closest('*[data-object]').addClass('updated');
        var already_wrapped = '';
        selected.each(function(){
            if (this.parentNode.nodeName === wrapper.toUpperCase()) {
                already_wrapped += $(this).text();
            }
        });
        if (already_wrapped.trim() == selected.text().trim()){ 
            // all wrapped
            selected.each(function(){
                var s = $(this);
                s.parent().replaceWith(s.html());
            });
        } else if (!already_wrapped){
            // none wrapped
            selected.each(function(){
                var s = $(this);
                s.replaceWith('<'+wrapper+'>'+s.html()+'</'+wrapper+'>');
            });
        } else {
            // partially wrapped
            selected.each(function(){
                var s = $(this);
                if (this.parentNode.nodeName !== wrapper.toUpperCase()) {
                    s.replaceWith('<'+wrapper+'>'+s.html()+'</'+wrapper+'>');
                }
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

    $('#header1').click(function(){
        if (rangy.getSelection().toString().length) {
            wrapSelection('h1');
        } else {
            // I don't know yet
        }
    });

    $('button[title="Bold"]').click(function(){
        wrapSelection('strong');
    });

    $('button[title="Italics"]').click(function(){
        wrapSelection('em');
    });

    $('button[title="Highlight"]').click(function(){
        wrapSelection('mark');
    });

    $('button[title="Strikethrough"]').click(function(){
        wrapSelection('strike');
    });

});
