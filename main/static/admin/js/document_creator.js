$(document).ready(function(){
    var iframe = $('#preview_iframe');

    function save_document(mark_outdated) {
        iframe.contents().find('.updated[data-object]').each(function(){
            var updated = $(this);
            var elemid = updated.data('object');
            var edited_text = updated.html().trim();
            updated.removeClass('updated');
            $.ajax({
                type: 'POST',
                url: markup_url,
                data: {'text': edited_text},
                success: function(data){
                    iframe.contents().find('#' + elemid + '-text')
                        .addClass('updated')
                        .val(data.markdown.trim());
                    if (mark_outdated) iframe.addClass('outdated');
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
            $.ajax({
                url: update_url,
                type: 'POST',
                data: text_dict,
                success: function(){
                    iframe.contents().find('input.updated').each(function(){
                        $(this).removeClass('updated');
                    });
                    if (mark_outdated) iframe.addClass('outdated');
                }
            });
        }
    }

    // Polling method to reload document preview iframe if changed
    window.setInterval(function(){
        if (iframe.hasClass('outdated')) {
            iframe.removeClass('outdated');
            save_document(false);
            iframe[0].contentWindow.location.reload();
        }
    }, 1000);

/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*
 *~*~*~*~*~*~*~*~           Bottom Button Bar       ~*~*~*~*~*~*~*~*~*~*~*~*~*
 *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*/
    $('button[title="Save"]').click(save_document);

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
            parent.replaceWith(parent.html());
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
            parent.replaceWith(parent.html());
        } else {
            selected.replaceWith('<em>'+selected.html()+'</em>');
        }
    });
});
