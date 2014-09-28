var tinymce_opts = {
    setup: function(editor) {
        editor.on('change', function(e) {
            var component = tinymce.activeEditor.dom;
            if (!component.hasClass(this.id, 'updated')) {
                component.addClass(this.id, 'updated');
            }
            tinyMCE.DOM.removeClass('.last_edited', 'last_edited');
            component.addClass(this.id, 'last_edited');
        })
    },
    element_format: 'html',
    fix_list_elements: true,
    fixed_toolbar_container: '#format_toolbar',
    /* Adapted from http://css-tricks.com/snippets/css/font-stacks/ */
    font_formats: [
        'Standard Serif=' + [
            'Cambria',
            '"Hoefler Text"',
            'Utopia', 
            '"Liberation Serif"',
            '"Nimbus Roman No9 L Regular"',
            'Times',
            '"Times New Roman"',
            'serif;'
        ].join(','),
        'Modern Serif=' + [
            'Constantia',
            '"Lucida Bright"',
            'Lucidabright',
            '"Lucida Serif"',
            'Lucida',
            '"DejaVu Serif"',
            '"Bitstream Vera Serif"',
            '"Liberation Serif"',
            'Georgia',
            'serif;'
        ].join(','),
        'Traditional Serif=' + [
            '"Palatino Linotype"',
            'Palatino',
            'Palladio',
            '"URW Palladio L"',
            '"Book Antiqua"',
            'Baskerville',
            '"Bookman Old Style"',
            '"Bitstream Charter"',
            '"Nimbus Roman No9 L"',
            'Garamond',
            '"Apple Garamond"',
            '"ITC Garamond Narrow"',
            '"New Century Schoolbook"',
            '"Century Schoolbook"',
            '"Century Schoolbook L"',
            'Georgia',
            'serif;'
        ].join(','),
        'Clean Sans=' + [
            'Helvetica',
            'Frutiger',
            '"Frutiger Linotype"',
            'Univers',
            'Calibri',
            '"Gill Sans"',
            '"Gill Sans MT"',
            '"Myriad Pro"',
            'Myriad',
            '"DejaVu Sans Condensed"',
            '"Liberation Sans"',
            '"Nimbus Sans L"',
            'Geneva',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif;'
        ].join(','),
        'Wide Sans=' + [
            'Corbel',
            '"Lucida Grande"',
            '"Lucida Sans Unicode"',
            '"Lucida Sans"',
            '"DejaVu Sans"',
            '"Bitstream Vera Sans"',
            '"Liberation Sans"',
            'Verdana',
            '"Verdana Ref"',
            'sans-serif;'
        ].join(','),
        'Fine Print Sans=' + [
            '"Segoe UI"',
            'Candara',
            '"Trebuchet MS"',
            '"Bitstream Vera Sans"',
            '"DejaVu Sans"',
            'Verdana',
            '"Verdana Ref"',
            'sans-serif;'
        ].join(','),
        'Bold Print Sans=' + [
            'Impact',
            'Haettenschweiler',
            '"Franklin Gothic Bold"',
            'Charcoal',
            '"Helvetica Inserat"',
            '"Bitstream Vera Sans Bold"',
            '"Arial Black"',
            'sans-serif;'
        ].join(','),
        'Fixed Width=' + [
            'Monaco',
            '"Liberation Mono"',
            'Consolas',
            '"Bitstream Vera Mono"',
            '"DejaVu Sans Mono"',
            '"Lucida Console"',
            '"Lucida Sans Typewriter"',
            '"Nimbus Mono L"',
            '"Courier New"',
            'Courier',
            'monospace;'
        ].join(',')
    ].join(''),
    inline: true,
    insertdatetime_formats: [
        '%d %B %Y',
        '%B %d, %Y',
        '%a, %b %d, %Y %I:%M %p',
        '%Y-%m-%d %H:%M',
        '%Y-%m-%d',
        '%H:%M',
        '%D %I:%M %p',
        '%D',
        '%I:%M %p'
    ],
    menubar: false,
    toolbar: [
        'fontselect | alignleft aligncenter alignright alignjustify',
        'bold italic | underline strikethrough | superscript subscript | removeformat',
        'link unlink | image media | blockquote hr | anchor',
        'bullist numlist | table | insertdatetime',
        'colorpicker',
        'cut copy paste pastetext | undo redo',
    ],
    plugins: [
        'advlist anchor autolink autosave colorpicker',
        'contextmenu hr image insertdatetime link lists',
        'media paste tabfocus table textpattern'
    ],
    schema: 'html5-strict',
    selector: '*[data-object]'
};
