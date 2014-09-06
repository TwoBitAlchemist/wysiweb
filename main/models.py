"""
High-level containers and document types.
"""
from django import template
from django.db import models
from mptt.models import MPTTModel, TreeForeignKey


class SelfRendering(object):
    """
    A mixin connecting a self-rendering model to its template.
    """
    def __init__(self, *args, **kwargs):
        self.type = 'html'

    def get_template(self):
        """
        Get the template associated with this model.

        Returns a django.template.Template object.
        """
        class_name = self.__class__.__name__.lower()
        model_template = 'elements/%s.%s' % (class_name, self.type)
        return template.loader.get_template(model_template)

    def supply_context(self):
        """
        Fill in context variables for this model's template to render.
        """
        raise NotImplementedError

    def render(self):
        """
        Render this model's template (as a string) using its context.
        """
        context = self.supply_context()
        return self.get_template().render(template.Context(context))


class BaseNode(MPTTModel, SelfRendering):
    """
    The base class for nodes in various tree structures.

    Provides MPTT-inherited features and basic funtionality.
    """
    class MPTTMeta:
        order_insertion_by = ('index',)

    parent = TreeForeignKey('self', null=True, blank=True,
                            related_name='children')
    index = models.PositiveSmallIntegerField()


class BaseElement(BaseNode):
    """
    Base class for SelfRendering elements with HTML-based template fragments
    and optional CSS/JS MediaObject components.
    """
    pass


class MediaObject(BaseNode):
    """
    CSS or JS to be loaded with a model in its parent document's header.
    """
    parent_element = models.ForeignKey(BaseElement, related_name='media')


class Document(models.Model, SelfRendering):
    """
    Generic container for a blank template.
    """
    name = models.CharField(max_length=255)
    elements = models.ManyToManyField(BaseElement, related_name='documents')

    def supply_context(self):
        return {
            'title': self.name,
            'elements': self.elements.all(),
        }

    def __unicode__(self):
        return self.name
