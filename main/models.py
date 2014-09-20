"""
High-level containers and document types.
"""
import re

from django import template
from django.contrib.auth.models import User
from django.db import models
# http://stackoverflow.com/a/929982/2588818
from model_utils.managers import InheritanceManager
from mptt.models import MPTTModel, TreeForeignKey


class SelfRendering(object):
    """
    A mixin connecting a self-rendering model to its template.
    """
    # pylint: disable=W0613
    def __init__(self, *args, **kwargs):
        self.filetype = 'html'

    def get_template(self):
        """
        Get the template associated with this model.

        Returns a django.template.Template object.
        """
        class_name = self.__class__.__name__.lower()
        model_template = 'elements/%s.%s' % (class_name, self.filetype)
        return template.loader.get_template(model_template)

    def supply_context(self):
        """
        Fill in context variables for this model's template to render.
        """
        raise NotImplementedError

    def render(self, indent=0):
        """
        Render this model's template (as a string) using its context.
        """
        context = self.supply_context()
        rendered = self.get_template().render(template.Context(context))
        rendered = (line.rstrip() for line in rendered.strip().splitlines())
        lspacing = ' ' * indent * 4
        # pylint: disable=W0141
        return ('\n' + lspacing).join(filter(bool, rendered))


# pylint: disable=W0223,R0904
class BaseNode(MPTTModel, SelfRendering):
    """
    The base class for nodes in various tree structures.

    Provides MPTT-inherited features and basic funtionality.
    """
    # pylint: disable=C0111,C1001,W0232,R0903
    class MPTTMeta:
        order_insertion_by = ('index',)

    parent = TreeForeignKey('self', null=True, blank=True,
                            related_name='children')
    index = models.PositiveSmallIntegerField(default=0)


# pylint: disable=R0904
class BaseElement(BaseNode):
    """
    Base class for SelfRendering elements with HTML-based template fragments
    and optional CSS/JS MediaObject components.
    """
    objects = InheritanceManager()
    text = models.TextField(blank=True, default='')

    def supply_context(self):
        return {'element': self}

    def save(self, *args, **kwargs):
        self.text = self.text.strip()
        return super(BaseElement, self).save(*args, **kwargs)


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
    owner = models.ForeignKey(User, limit_choices_to={'is_staff': True},
                              related_name='documents')

    # pylint: disable=E1101
    def has_elements(self):
        """
        Utility function for templates to check whether or not rendering the
        Document will result in visible HTML.

        Returns True if Document has attached elements, False otherwise.
        """
        return bool(len(self.elements.all()))

    # pylint: disable=E1101
    def supply_context(self):
        return {
            'document': self,
            'elements': self.elements.select_subclasses(),
        }

    def __unicode__(self):
        return self.name


# pylint: disable=R0903
class ComponentLibrary(object):
    """
    Similar to django.template.Library for storing components registered to the
    DocumentCreator toolbar.
    """
    # pylint: disable=W0613
    def __init__(self, *args, **kwargs):
        self.components = {}

    def register(self, class_=None, name=None, desc=None, group=None):
        """
        Register a class to appear on the DocumentCreator toolbar.
        """
        if class_ is None:
            # pylint: disable=C0111
            def decorator(class_):
                return self.register(class_, name, desc, group)
            return decorator

        if group is None:
            group = 'Miscellaneous'

        if name is None:
            pattern = r'([A-Z]){1}'     # exactly one uppercase letter
            name = re.sub(re.compile(pattern), r' \1', class_.__name__).strip()

        if desc is None:
            desc = class_.__doc__.strip()
            desc = '\n'.join((line.strip() for line in desc.splitlines()))
            if len(desc) > 255:
                desc = desc[:252] + '...'

        component = {'name': name, 'description': desc}
        try:
            self.components[group].append(component)
        except KeyError:
            self.components[group] = [component]

        return class_
