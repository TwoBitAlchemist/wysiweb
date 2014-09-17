import json

from django.contrib.admin.views.decorators import staff_member_required
from django.forms.models import modelform_factory
from django.http import Http404, HttpResponse, HttpResponseServerError
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django import template
from django.views.decorators.cache import never_cache
from html2text import html2text

from main.models import Document
import components.models
from components.models import toolbar


def get_modelform(model):
    """
    Helper method to call modelform_factory with consistent options.
    """
    return modelform_factory(model, exclude=('parent', 'index', 'text'))


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
def document_preview(request, pk):
    """
    View for rendering a Document's template inside an iframe in the admin.
    """
    try:
        document = Document.objects.get(pk=pk)
        editable = request.GET.get('editable', False)
        if editable:
            response = render(request, 'ui/preview.html',
                              document.supply_context())
        else:
            template_string = ''.join((
                '{% autoescape off %}',
                '{{ document.render }}',
                '{% endautoescape %}',
            ))
            if request.GET.get('print', False):
                template_string += '<script>window.print();</script>'
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
def markup(request):
    """
    Handle AJAX requests to convert HTML to Markdown.
    """
    if not request.is_ajax() and not request.method=='POST':
        raise Http404
    try:
        text_with_html = request.POST['text']
        return JsonResponse({'markdown': html2text(text_with_html)})
    except KeyError:
        return HttpResponseServerError('No text provided to convert!')


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
                name, pk = key.split('-')
                model = getattr(components.models, name).objects.get(pk=pk)
                model.text = value
                model.save()
            except (AttributeError, ValueError, model.DoesNotExist):
                continue
        return HttpResponse('OK!')
    except (Document.DoesNotExist, KeyError):
        raise Http404
