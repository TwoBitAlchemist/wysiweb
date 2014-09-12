import json

from django.forms.models import modelform_factory
from django.http import Http404, HttpResponse
from django.shortcuts import render
from django import template

from main.models import Document
import components.models
from components.models import toolbar


def add_to_document(request):
    """
    Handle AJAX requests to add an element to the current document.
    """
    pass


def default_toolbar(request):
    """
    Populate the DocumentCreator toolbar with premade components organized
    into jQuery UI tabs based on their ComponentType.
    """
    try:
        document = request.GET['document']
    except KeyError:
        raise Http404
    context = {'components': toolbar.components, 'document': document}
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
        model = getattr(components.models, request.GET['model'])
        document = request.GET['document']
    except (AttributeError, KeyError):
        return HttpResponse('No tool selected.')

    modelform = modelform_factory(model, exclude=('parent', 'index', 'text'))
    context = {
        'form': str(modelform()),
        'model': model.__name__,
        'document': document,
    }
    return render(request, 'ui/toolopts.html', context)
