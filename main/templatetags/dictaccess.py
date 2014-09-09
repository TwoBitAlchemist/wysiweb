from django import template

register = template.Library()

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
