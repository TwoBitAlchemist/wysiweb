var actionBarTimerID, rangy, selectionTimerID, wrapper;


function get_bootstrap_col_size(w){
    /*
    Return a string ('xs', 'sm', 'md', 'lg') corresponding to the Bootstrap
    abbreviation for the current column size for the window given.
    (Defaults to the global window object.)
    */
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
    /*
    Return a list of regexes that can be used to find class names corresponding
    to col_size, which defaults to the current column size if not given.
    */
    if (!col_size)
        col_size = get_bootstrap_col_size();
    return [
        new RegExp('col-'+col_size+'-\\d+'),
        new RegExp('col-'+col_size+'-offset-\\d+'),
        new RegExp('col-'+col_size+'-pull-\\d+'),
        new RegExp('col-'+col_size+'-push-\\d+')
    ];
}


function get_bootstrap_col_info(elem){
    /*
    Read settings (width in cols, offset, push, pull) from elem's classes
    using the currently active column size and return an object containing
    the current settings. Only returns information present in classes.
    (e.g., some attributes may be undefined)
    */
    var col_regexes = get_bootstrap_col_regexes();
    var cols_wide = 12;
    var size_class = elem.className.match(col_regexes[0]);
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
    /* Remove Bootstrap col-{size}* classes for the current column size */
    var col_regexes = get_bootstrap_col_regexes(col_size);
    for (var i=0; i<col_regexes.length; i++) {
        elem.className = elem.className.replace(col_regexes[i], '');
    }
    /* Remove unnecessary spaces */
    elem.className = elem.className
                        .split(' ')
                        .filter(function(n){ return !!n; })
                        .join(' ');
}


function set_bootstrap_col_info(elem){
    /*
    Measure elem and set Bootstrap classes on it as implied by its current
    size and position, relative to the current column size.
    */
    var orig_offset = get_bootstrap_col_info(elem).offset || 0;
    remove_bootstrap_col_info(elem);
    elem = $(elem);
    var container = elem.closest('.row');
    var col_size = get_bootstrap_col_size();
    if (DEBUG) console.log('Column size detected: ' + col_size);
    var col_width = Math.round(container.width() / 12);
    if (DEBUG) console.log('Column width: ' + col_width);
    var container_offset = container.offset().left;
    var left_position = elem.offset().left - container_offset;
    if (DEBUG) console.log('Calculated l-position: ' + left_position);
    var col_offset = Math.round(left_position / col_width) + orig_offset;
    if (col_offset < 0) {
        col_offset = 0;
    } else if (col_offset > 12) {
        col_offset = 12;
    }
    if (col_offset) elem.addClass('col-'+col_size+'-offset-'+col_offset);
    if (DEBUG) console.log('Original offset: ' + orig_offset);
    if (DEBUG) console.log('New offset: ' + col_offset);
    var cols_wide = Math.round(elem.innerWidth() / col_width);
    if (DEBUG) console.log('Cols wide: ' + cols_wide);
    if (cols_wide < 12) elem.addClass('col-'+col_size+'-'+cols_wide);
    $('#'+elem.data('object')+'-text')
        .data('col_'+col_size, cols_wide)
        .data('col_'+col_size+'_offset', col_offset);
}


$(document).ready(function(){
    /* Enable Rangy */
    rangy.init();
    var rangy_opts = {normalize: true, applyToEditableOnly: true};
    wrapper = rangy.createCssClassApplier('selected', rangy_opts);

    /* Enable TinyMCE */
    tinymce.init(tinymce_opts);

    /* Enable effects for start screen */
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
    if (selectionTimerID) window.clearTimeout(selectionTimerID);
    selectionTimerID = window.setTimeout(function(){
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
}).on('blur', '*[data-object]', function(){
    window.clearTimeout(actionBarTimerID);
    actionBarTimerID = window.setTimeout(function(){
        $('#action_button_bar').remove();
        $('.action-bar-active').removeClass('action-bar-active');
    }, 100);
}).on('click', '*[data-object]', function(){
    if (!$(this).is(':focus')) $(this).focus();
}).on(' focus', '*[data-object]', function(){
    $('#action_button_bar').remove();
    $('.action-bar-active').removeClass('action-bar-active');
    var self = $(this);
    self.addClass('action-bar-active');
    var buttonbar = $('<div id="action_button_bar"></div>');
    var css = {
        'background-color': 'lightgrey',
        'border-radius': '3px',
        'font-size': '24px',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '64px',
        height: '30px',
        'z-index': 1000
    };
    buttonbar.css(css);
    var handle = $('<span id="movehandle" title="Drag"></span>');
    handle.addClass('glyphicon glyphicon-move');
    handle.css({ position: 'relative', top: '3px', cursor: 'move' });
    var close = $('<button id="deleteobj" title="Delete"></button>');
    close.addClass('btn btn-sm btn-danger');
    close.append($('<span class="glyphicon glyphicon-remove"></span>'));
    close.css({ position: 'relative', top: '-3px', 'margin-right': '3px' });
    close.mousedown(function(){
        var target = $(this).closest('*[data-object]');
        var destroy;
        if (!target.hasClass('updated')) {
            destroy = true;
        } else {
            destroy = window.confirm('Permanently delete unsaved object?');
        }
        if (destroy){
            target.remove();
            $('#format_toolbar').remove();
        }
    });
    buttonbar.append(close);
    buttonbar.append(handle);
    self.append(buttonbar);
    var container = self.closest('.row');
    var col_size = get_bootstrap_col_size();
    var col_width = Math.round(container.width() / 12);
    self.draggable({
        axis: 'x',
        grid: [col_width, container.height()],
        handle: '#movehandle',
        stop: function(e, ui){
            set_bootstrap_col_info(this);
            $(this).css({top: 0, left: 0});
        }
    }).resizable({
        containment: '.row',
        grid: col_width,
        minWidth: col_width,
        maxWidth: container.width(),
        stop: function(e, ui) {
            set_bootstrap_col_info(this);
        }
    });
});
