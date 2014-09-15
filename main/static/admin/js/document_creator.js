$(document).ready(function(){
    /* https://docs.djangoproject.com/en/dev/ref/contrib/csrf/#ajax */
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    // From Django docs: send along {% csrf_token %} with AJAX requests
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                var csrftoken = getCookie('csrftoken');
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    function save_document() {
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
                    iframe.addClass('outdated');
                }
            });
        }
    }

    // Polling method to reload document preview iframe if changed
    var iframe = $('#preview_iframe');
    window.setInterval(function(){
        if (iframe.hasClass('outdated')) {
            save_document();
            iframe[0].contentWindow.location.reload();
            iframe.removeClass('outdated');
        }
    }, 1500);

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
    function Selection(){
        // q.v. snap_selection.js
        var parent = getSelectionParentElement(iframe[0]);
        var parentObj = $(parent).closest('*[data-object]').data('object');
        return {
            "text": getSelectionText(iframe[0]),
            "controller": iframe.contents().find('#' + parentObj + '-text')
        };
    }

    $('button[title="Bold"]').click(function(){
        var s = Selection();
        s.controller
            .addClass('updated')
            .val(s.controller.val().replace(s.text, '**' + s.text + '**'));
        iframe.addClass('outdated');
    });

    $('button[title="Italics"]').click(function(){
        var s = Selection();
        s.controller
            .addClass('updated')
            .val(s.controller.val().replace(s.text, '_' + s.text + '_'));
        iframe.addClass('outdated');
    });
});
