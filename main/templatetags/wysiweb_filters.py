"""
Template filters provided by WYSIWEB for working with element templates.
"""
from django import template
from django.utils.safestring import mark_safe

# pylint: disable=C0103
register = template.Library()


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
def range_to(start, stop):
    """
    Return a numeric range using the specified bounds.

    This allows for numeric for loops in templates, which Django's
    templates do not support natively.
    """
    try:
        range = xrange
    except NameError:
        pass
    return range(start, stop)


@register.filter
def render(node, preview=False):
    """
    Call a SelfRendering node's render method with the specified indent level.
    """
    try:
        return mark_safe(node.render(indent=node.level+1, preview=preview))
    except AttributeError:
        return ''
