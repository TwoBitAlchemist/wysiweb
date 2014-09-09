import json

from django.forms.models import modelform_factory
from django.http import Http404, HttpResponse
from django.shortcuts import render
from django import template

from main.models import Document
from components import models as component_model
from components.models import toolbar


def default_toolbar(request):
    """
    Populate the DocumentCreator toolbar with premade components organized
    into jQuery UI tabs based on their ComponentType.
    """
    context = {'components': toolbar.components}
    return render(request, 'ui/toolbar.html', context)


def document_preview(request, pk):
    """
    View for rendering a Document's template inside an iframe in the admin.
    """
    try:
        document = Document.objects.get(pk=pk)
        template_text = ''.join((
            '{% autoescape off %}',
            '{{ document.render }}',
            '{% endautoescape %}',
        ))
        preview_template = template.Template(template_text)
        preview_context = template.Context({'document': document})
        return HttpResponse(preview_template.render(preview_context))
    except Document.DoesNotExist:
        raise Http404


def generate_tool_options(request):
    """
    Imports a component on the fly and creates a ModelForm for it.
    """
    try:
        model = getattr(component_model, request.GET['model'])
    except (AttributeError, KeyError):
        raise Http404

    modelform = modelform_factory(model, exclude=('parent', 'index'))
    if request.is_ajax():
        return HttpResponse(json.dumps({'form': str(modelform())}),
                            content_type='application/json')
    else:
        raise Http404
