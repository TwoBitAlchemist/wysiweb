from django import template
from django.template.defaultfilters import stringfilter
from django.utils.safestring import mark_safe
from markdown import markdown as convert_markdown

register = template.Library()


@register.filter
def elemid(obj):
    """
    Return a unique identifier for this element.
    """
    return '%s-%s' % (obj.__class__.__name__, obj.pk)


@register.filter
def dictaccess(d, key):
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
@stringfilter
def markdown(text, safe_mode='escape'):
    """
    Parse text as Markdown using Python's Markdown library.
    """
    extensions = (
        'abbr',
        'attr_list',
        'def_list',
        'fenced_code',
        'footnotes',
        'smart_strong',
        'codehilite',
        'nl2br',
        'smarty',
    )
    options = {
        'extensions': extensions,
        'output_format': 'html5',
        'safe_mode': safe_mode,
        'html_replacement_text': '',
    }
    return mark_safe(convert_markdown(text, **options))


@register.filter
def render(node):
    """
    Call a SelfRendering node's render method with the specified indent level.
    """
    try:
        return mark_safe(node.render(indent=node.level+1))
    except AttributeError:
        return ''
