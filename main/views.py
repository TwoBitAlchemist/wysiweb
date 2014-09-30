"""
Views and helper functions for handling DocumentCreator's various requests.
"""
from django.conf import settings
from django.contrib.admin.views.decorators import staff_member_required
from django.forms.models import modelform_factory
from django.http import Http404, HttpResponse
from django.shortcuts import redirect, render
from django import template
from django.views.decorators.cache import never_cache

from main.models import Document
import components.models
from components.models import toolbar


def get_modelform(model):
    """
    Helper method to call modelform_factory with consistent options.
    """
    exclude_fields = ['parent', 'index', 'text']
    for col_size in ('xs', 'sm', 'md', 'lg'):
        for suffix in ('', '_offset', '_pull', '_push'):
            exclude_fields.append('col_%s%s' % (col_size, suffix))
    return modelform_factory(model, exclude=exclude_fields)


# pylint: disable=E1101
@staff_member_required
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


@staff_member_required
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


@never_cache
@staff_member_required
def document_preview(request, pk):  # pylint: disable=C0103
    """
    View for rendering a Document's template inside an iframe in the admin.
    """
    try:
        # pylint: disable=E1101
        document = Document.objects.get(pk=pk)
        editable = request.GET.get('editable', False)
        context = document.supply_context()
        context.update({'DEBUG': settings.DEBUG})
        if editable:
            response = render(request, 'ui/preview.html', context)
        else:
            template_string = ''.join((
                '{% autoescape off %}',
                '{{ document.render }}',
                '{% endautoescape %}',
            ))
            if request.GET.get('print', False):
                template_string += '<script>window.print();</script>'
            # pylint: disable=C0103
            t = template.Template(template_string)
            context = template.Context({'document': document})
            response = HttpResponse(t.render(context))
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        return response
    except Document.DoesNotExist:
        raise Http404


@staff_member_required
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


@staff_member_required
def update_elements(request):
    """
    AJAX handler to update elements on a document.
    """
    if not request.is_ajax() or not request.method == 'POST':
        raise Http404
    try:
        for key, value in request.POST.items():
            try:
                name, pk = key.split('-')   # pylint: disable=C0103
                model = getattr(components.models, name).objects.get(pk=pk)
                model.text = value
                model.save()
            except (AttributeError, ValueError, model.DoesNotExist):
                continue
        return HttpResponse('OK!')
    except (Document.DoesNotExist, KeyError):
        raise Http404
