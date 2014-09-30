"""
Template filters provided by WYSIWEB for working with element templates.
"""
from django import template
from django.utils.safestring import mark_safe

# pylint: disable=C0103
register = template.Library()


@register.filter
def classes(element, default_list=None):
    """
    Output the correct Bootstrap classes based on element's settings.
    """
    class_list = [] if not default_list else default_list.strip().split()
    col_sizes = ('xs', 'sm', 'md', 'lg')
    for size in col_sizes:
        cols = getattr(element, 'col_%s' % size)
        if cols:
            class_list.append('col-%s-%s' % (size, cols))
        offset = getattr(element, 'col_%s_offset' % size)
        if offset:
            class_list.append('col-%s-offset-%s' % (size, offset))
        pull = getattr(element, 'col_%s_pull' % size)
        if pull:
            class_list.append('col-%s-pull-%s' % (size, pull))
        push = getattr(element, 'col_%s_push' % size)
        if push:
            class_list.append('col-%s-push-%s' % (size, push))
    return ' '.join(class_list)


@register.filter
def dictaccess(d, key):     # pylint: disable=C0103
    """
    Access dict value by key.

    This allows for dict lookups using template variables, which Django's
    templates do not support natively.
    """
    try:
        return d[key]
    except KeyError:
        return None


@register.filter
def elemid(obj):
    """
    Return a unique identifier for this element.
    """
    return '%s-%s' % (obj.__class__.__name__, obj.pk)


@register.filter
def griddata(elem):
    """
    Add data classes for gridster.js plugin.
    """
    pass


@register.filter
def render(node):
    """
    Call a SelfRendering node's render method with the specified indent level.
    """
    try:
        return mark_safe(node.render(indent=node.level+1))
    except AttributeError:
        return ''
