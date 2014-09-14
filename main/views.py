from django.forms.models import modelform_factory
from django.http import Http404, HttpResponse
from django.shortcuts import redirect, render
from django import template

from main.models import Document
import components.models
from components.models import toolbar


def get_modelform(model):
    """
    Helper method to call modelform_factory with consistent options.
    """
    return modelform_factory(model, exclude=('parent', 'index', 'text'))


def add_to_document(request):
    """
    Handle AJAX requests to add an element to the current document.
    """
    if not request.method == 'POST':
        raise Http404
    try:
        document = Document.objects.get(pk=request.POST['document'])
        model = getattr(components.models, request.POST['model'])
    except (AttributeError, Document.DoesNotExist, KeyError):
        raise Http404

    modelform = get_modelform(model)(request.POST)
    instance = modelform.save()
    document.elements.add(instance)
    return redirect('toolopts')


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
        editable = request.GET.get('editable', False)
        if editable:
            return render(request, 'ui/preview.html',
                          document.supply_context())
        else:
            t = template.Template(
                    '{% autoescape off %}'
                    '{{ document.render }}'
                    '{% endautoescape %}'
                )
            context = template.Context({'document': document})
            return HttpResponse(t.render(context))
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

    form = str(get_modelform(model)())
    context = {
        'form': form,
        'model': model.__name__,
        'document': document,
    }
    return render(request, 'ui/toolopts.html', context)
