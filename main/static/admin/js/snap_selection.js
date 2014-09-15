/*
 * Originally written by Tim Down: https://stackoverflow.com/u/96100
 * Crowd-sourced on this SO answer: https://stackoverflow.com/a/7381574
 * Live Demo: http://jsfiddle.net/rrvw4/23/
 */
function snapSelectionToWord() {
    var sel;

    // Check for existence of window.getSelection() and that it has a
    // modify() method. IE 9 has both selection APIs but no modify() method.
    if (window.getSelection && (sel = window.getSelection()).modify) {
        sel = window.getSelection();
        if (!sel.isCollapsed) {

            // Detect if selection is backwards
            var range = document.createRange();
            range.setStart(sel.anchorNode, sel.anchorOffset);
            range.setEnd(sel.focusNode, sel.focusOffset);
            var backwards = range.collapsed;

            // modify() works on the focus of the selection
            var endNode = sel.focusNode, endOffset = sel.focusOffset;
            sel.collapse(sel.anchorNode, sel.anchorOffset);
            
            var direction = [];
            if (backwards) {
                direction = ['backward', 'forward'];
            } else {
                direction = ['forward', 'backward'];
            }

            sel.modify("move", direction[0], "character");
            sel.modify("move", direction[1], "word");
            sel.extend(endNode, endOffset);
            sel.modify("extend", direction[1], "character");
            sel.modify("extend", direction[0], "word");
        }
    } else if ( (sel = document.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        if (textRange.text) {
            textRange.expand("word");
            // Move the end back to not include the word's trailing space(s),
            // if necessary
            while (/\s$/.test(textRange.text)) {
                textRange.moveEnd("character", -1);
            }
            textRange.select();
        }
    }
}

// http://stackoverflow.com/a/5379408
// modified with frame argument to work with iframes
function getSelectionText(frame) {
    if (frame) {
        var w = frame.contentWindow;
        var d = frame.contentDocument;
    } else {
        var w = window;
        var d = document;
    }
    var text = "";
    if (w.getSelection) {
        text = w.getSelection().toString();
    } else if (d.selection && d.selection.type != "Control") {
        text = d.selection.createRange().text;
    }
    return text;
}

// http://stackoverflow.com/a/7215665/2588818
// modified with frame argument to work with iframes
function getSelectionParentElement(frame) {
    if (frame) {
        var w = frame.contentWindow;
        var d = frame.contentDocument;
    } else {
        var w = window;
        var d = document;
    }
    var parentEl = null, sel;
    if (w.getSelection) {
        sel = w.getSelection();
        if (sel.rangeCount) {
            parentEl = sel.getRangeAt(0).commonAncestorContainer;
            if (parentEl.nodeType != 1) {
                parentEl = parentEl.parentNode;
            }
        }
    } else if ( (sel = d.selection) && sel.type != "Control") {
        parentEl = sel.createRange().parentElement();
    }
    return parentEl;
}
