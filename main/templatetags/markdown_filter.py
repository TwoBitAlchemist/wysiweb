from django import template
from django.template.defaultfilters import stringfilter
from django.utils.safestring import mark_safe
from markdown import markdown as convert_markdown

register = template.Library()

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
