$(document).ready(function(){
    var iframe = $('#preview_iframe');

    function save_document(no_refresh) {
        console.log('Checking for updates...');
        var document_updated = false;
        iframe.contents().find('.updated[data-object]').each(function(){
            var updated = $(this);
            var elemid = updated.data('object');
            console.log('Updating ' + elemid + '...');
            var edited_text = updated.html().trim();
            updated.removeClass('updated');
            $.ajax({
                async: false,
                type: 'POST',
                url: markup_url,
                data: {'text': edited_text},
                success: function(data){
                    iframe.contents().find('#' + elemid + '-text')
                        .addClass('updated')
                        .val(data.markdown.trim());
                    document_updated = true;
                    console.log(elemid + ' updated!');
                }
            });
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
                    document_updated = true;
                }
            });
        }

        if (document_updated && !no_refresh) {
            console.log('Refreshing...');
            iframe.addClass('outdated');
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

/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*
 *~*~*~*~*~*~*~*~           Bottom Button Bar       ~*~*~*~*~*~*~*~*~*~*~*~*~*
 *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*/
    $('button[title="Save"]').click(function(){
        save_document();
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
    $('button[title="Bold"]').click(function(){
        var selected = iframe.contents().find('.selected');
        selected.closest('*[data-object]').addClass('updated');
        var parent = selected.parent();
        var parentNode = parent[0].nodeName;
        if (parentNode === 'STRONG' || parentNode === 'B') {
            parent.replaceWith(parent.siblings().html());
        } else {
            selected.replaceWith('<strong>'+selected.html()+'</strong>');
        }
    });

    $('button[title="Italics"]').click(function(){
        var selected = iframe.contents().find('.selected');
        selected.closest('*[data-object]').addClass('updated');
        var parent = selected.parent();
        var parentNode = parent[0].nodeName;
        if (parentNode === 'EM' || parentNode === 'I') {
            parent.replaceWith(parent.siblings().html());
        } else {
            selected.replaceWith('<em>'+selected.html()+'</em>');
        }
    });
});
