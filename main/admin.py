from django.conf import settings
from django.contrib import admin

from main.models import Document


# pylint: disable=R0904
class DocumentCreator(admin.ModelAdmin):
    """
    Overrides for Django Admin when creating a new Document.
    """
    exclude = ('elements', 'owner', 'rows')

    def change_view(self, request, object_id, from_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['DEBUG'] = settings.DEBUG
        return (super(DocumentCreator, self)
                    .change_view(request, object_id, from_url, extra_context))

    def has_change_permission(self, request, obj=None):
        has_class_permission = (super(DocumentCreator, self).
                                has_change_permission(request, obj))
        if not has_class_permission:
            return False
        elif (obj is not None and not request.user.is_superuser and
                request.user.id != obj.owner.id):
            return False
        else:
            return True

    def get_queryset(self, request):
        if settings.DEBUG and request.user.is_superuser:
            return Document.objects.all()
        return Document.objects.filter(owner=request.user)

    def save_model(self, request, obj, form, change):
        if not change:
            obj.owner = request.user
        obj.save()

admin.site.register(Document, DocumentCreator)
