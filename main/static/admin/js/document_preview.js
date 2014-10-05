var rangy, timerID, wrapper;


function get_bootstrap_col_size(w){
    if (!w) w = window;
    var page_width = $(w).width();
    if (page_width < 768)
        return 'xs';
    else if (page_width < 992)
        return 'sm';
    else if (page_width < 1200)
        return 'md';
    else
        return 'lg';
}


function get_bootstrap_col_regexes(col_size){
    if (!col_size)
        col_size = get_bootstrap_col_size();
    return [
        new RegExp('col-'+col_size+'-\\d+ '),
        new RegExp('col-'+col_size+'-offset-\\d+ '),
        new RegExp('col-'+col_size+'-pull-\\d+ '),
        new RegExp('col-'+col_size+'-push-\\d+ ')
    ];
}


function get_bootstrap_col_info(elem){
    var col_regexes = get_bootstrap_col_regexes();
    var size_class = elem.className.match(col_regexes[0]);
    var cols_wide = 12;
    if (size_class) {
        cols_wide = parseInt(size_class[0].split('-')[2].trim(), 10);
    }
    var col_info = {size: cols_wide};
    var attr_class;
    for (var i=1; i<col_regexes.length; i++) {
        attr_class = elem.className.match(col_regexes[i]);
        if (!attr_class) continue;
        var attr_parts = attr_class[0].split('-');
        col_info[attr_parts[2]] = parseInt(attr_parts[3].trim(), 10);
    }
    return col_info;
}


function remove_bootstrap_col_info(elem, col_size){
    var col_regexes = get_bootstrap_col_regexes(col_size);
    for (var i=0; i<col_regexes.length; i++) {
        elem.className = elem.className.replace(col_regexes[i], '');
    }
}


function set_bootstrap_col_info(elem, ui){
    var orig_offset = get_bootstrap_col_info(elem).offset || 0;
    remove_bootstrap_col_info(elem);
    elem = $(elem);
    var container = elem.closest('.row');
    var col_width = Math.round(container.width() / 12);
    var cols_wide = Math.round(elem.innerWidth() / col_width);
    var col_size = get_bootstrap_col_size();
    var col_offset = Math.round(ui.position.left / col_width) + orig_offset;
    var updater = $('#'+elem.data('object')+'-text');
    updater.data('col_'+col_size, cols_wide)
    if (col_offset) {
        elem.addClass('col-'+col_size+'-offset-'+col_offset);
        updater.data('col_'+col_size+'_offset', col_offset);
    }
    elem.addClass('col-'+col_size+'-'+cols_wide);
}


$(document).ready(function(){
    /* Enable Rangy */
    rangy.init();
    var rangy_opts = {normalize: true, applyToEditableOnly: true};
    wrapper = rangy.createCssClassApplier('selected', rangy_opts);

    /* Enable TinyMCE */
    tinymce.init(tinymce_opts);
    $('span.highlight_element')
        .css({
            'color': 'dodgerblue',
            'cursor': 'pointer',
            'text-decoration': 'underline'
        })
        .click(function(){
            var flash = $(window.parent.document).find('#'+$(this).data('id'));
            var interval = window.setInterval(function(){
                flash.toggleClass('flash');
            }, 100);
            window.setTimeout(function(){
                window.clearInterval(interval);
            }, 1100);
        });
}).on('mouseup keydown', '*[data-object]', function(){
    if (timerID) window.clearTimeout(timerID);
    timerID = window.setTimeout(function(){
        var sel = rangy.getSelection();
        if (sel.toString().length > 1) {
            wrapper.applyToSelection();
            var selected = $('.selected');
            var selected_text = esrever.reverse(selected.text());
            var component = selected.closest('*[data-object]');
            var component_text = esrever.reverse(component.text().trim());
            if (selected_text != component_text) {
                if (component_text.indexOf(selected_text)) {
                    wrapper.undoToSelection();
                    sel.expand('word', {
                        trim: true
                    });
                } else {
                    var range = sel.getRangeAt(0);
                    range.move('word', -1);
                    range.setEndAfter(selected.parent()[0]);
                    wrapper.undoToSelection();
                    sel.setSingleRange(range);
                }
                wrapper.applyToSelection();
            }
        }
    }, 120);
}).on('mousedown', '*[data-object]', function(){
    $('.selected').each(function(){
        var s = $(this);
        s.replaceWith(s.html());
    });
}).on('click', '*[data-object]', function(){
    $(this).focus();
}).on('focus', '*[data-object]', function(){
    $('#movehandle').remove();
    var self = $(this);
    self.css({position: 'relative', top: 0, left: 0});
    var handle = $('<span id="movehandle" title="Drag"></span>');
    handle.addClass('glyphicon glyphicon-move');
    var css = {
        position: 'absolute',
        top: '2px',
        left: '2px',
        cursor: 'move',
        'font-size': '24px',
        'z-index': 1000
    };
    handle.css(css);
    self.append(handle);
    var close = $('<button id="deleteobj" title="Delete"></button>');
    close.addClass('btn btn-xs btn-danger');
    close.append($('<span class="glyphicon glyphicon-remove"></span>'));
    css.left = '30px';
    css.cursor = 'default';
    css['font-size'] = '16px';
    close.css(css);
    close.mousedown(function(){
        var target = $(this).closest('*[data-object]');
        var destroy;
        if (!target.hasClass('updated')) {
            destroy = true;
        } else {
            destroy = window.confirm('Permanently delete unsaved object?');
        }
        if (destroy) target.remove();
    });
    self.append(close);
    var container = self.closest('.row');
    var col_width = Math.round(container.width() / 12);
    self.draggable({
        axis: 'x',
        grid: [col_width, container.height()],
        handle: '#movehandle',
        stop: function(e, ui){
            set_bootstrap_col_info(this, ui);
        }
    }).resizable({
        containment: '.row',
        grid: col_width,
        minWidth: col_width,
        maxWidth: container.width(),
        stop: function(e, ui) {
            set_bootstrap_col_info(this, ui);
        }
    });
}).on('blur', '*[data-object]', function(){
    $('#movehandle, #deleteobj').css('visibility', 'hidden');
});
