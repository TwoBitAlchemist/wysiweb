from django.shortcuts import render

from components.models import ComponentType


def default_toolbar(request):
    """
    Populate the DocumentCreator toolbar with premade components organized
    into jQuery UI tabs based on their ComponentType.
    """
    components = {}
    for type in ComponentType.objects.all():
        components[type] = 'This is a test.'
    return render(request, 'ui/toolbar.html', {'components': components})
