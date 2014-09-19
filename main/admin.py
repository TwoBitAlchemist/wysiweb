from django.contrib import admin

from main.models import Document


# pylint: disable=R0904
class DocumentCreator(admin.ModelAdmin):
    """
    Overrides for Django Admin when creating a new Document.
    """
    exclude = ('elements',)

admin.site.register(Document, DocumentCreator)
