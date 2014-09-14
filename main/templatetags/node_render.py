from django import template
from django.template.defaultfilters import stringfilter
from django.utils.safestring import mark_safe

register = template.Library()

@register.filter
def render(node):
    """
    Call a SelfRendering node's render method with the specified indent level.
    """
    try:
        return mark_safe(node.render(indent=node.level+1))
    except AttributeError:
        return ''
