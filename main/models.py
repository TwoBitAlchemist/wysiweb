"""
High-level containers and document types.
"""
import re

from django import template
from django.contrib.auth.models import User
from django.db import models
from django.utils import html
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

    def render(self, indent=0, preview=False):
        """
        Render this model's template (as a string) using its context.
        """
        context = self.supply_context()
        context.update({'preview': bool(preview)})
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
    row = models.ForeignKey('GridRow', related_name='elements')

    # Bootstrap Grid Layout Options
    col_xs = models.PositiveSmallIntegerField(default=0)
    col_sm = models.PositiveSmallIntegerField(default=0)
    col_md = models.PositiveSmallIntegerField(default=0)
    col_lg = models.PositiveSmallIntegerField(default=0)
    col_xs_offset = models.PositiveSmallIntegerField(default=0)
    col_sm_offset = models.PositiveSmallIntegerField(default=0)
    col_md_offset = models.PositiveSmallIntegerField(default=0)
    col_lg_offset = models.PositiveSmallIntegerField(default=0)
    col_xs_pull = models.PositiveSmallIntegerField(default=0)
    col_sm_pull = models.PositiveSmallIntegerField(default=0)
    col_md_pull = models.PositiveSmallIntegerField(default=0)
    col_lg_pull = models.PositiveSmallIntegerField(default=0)
    col_xs_push = models.PositiveSmallIntegerField(default=0)
    col_sm_push = models.PositiveSmallIntegerField(default=0)
    col_md_push = models.PositiveSmallIntegerField(default=0)
    col_lg_push = models.PositiveSmallIntegerField(default=0)
    
    @property
    def classes(self):
        """
        Output the correct Bootstrap classes based on element's settings.
        """
        class_list = []
        for size in ('xs', 'sm', 'md', 'lg'):
            cols = getattr(self, 'col_%s' % size)
            if cols:
                class_list.append('col-%s-%s' % (size, cols))
            offset = getattr(self, 'col_%s_offset' % size)
            if offset:
                class_list.append('col-%s-offset-%s' % (size, offset))
            pull = getattr(self, 'col_%s_pull' % size)
            if pull:
                class_list.append('col-%s-pull-%s' % (size, pull))
            push = getattr(self, 'col_%s_push' % size)
            if push:
                class_list.append('col-%s-push-%s' % (size, push))
        return class_list

    def supply_context(self):
        return {'element': self}

    def save(self, *args, **kwargs):
        self.text = self.text.strip()
        for col_size in ('xs', 'sm', 'md', 'lg'):
            for suffix in ('', 'offset', 'pull', 'push'):
                field_name_parts = ['col', col_size]
                if suffix:
                    field_name_parts.append(suffix)
                field_name = '_'.join(field_name_parts)
                field_val = getattr(self, field_name)
                if not (0 <= field_val < 12):
                    setattr(self, field_name, 0)
        return super(BaseElement, self).save(*args, **kwargs)

    def __unicode__(self):
        return html.strip_tags(self.text)


class MediaObject(BaseNode):
    """
    CSS or JS to be loaded with a model in its parent document's header.
    """
    parent_element = models.ForeignKey(BaseElement, related_name='media')


class UserUpload(models.Model, SelfRendering):
    """
    Files (images, videos, documents, etc.) uploaded by a User and
    attached to one or more Documents.
    """
    last_modified = models.DateTimeField(auto_now=True)
    uploaded_by = models.ForeignKey(User, related_name='uploads',
                                    limit_choices_to={'is_staff': True})
    uploaded_file = models.FileField(upload_to='uploaded_files')
    UPLOAD_TYPES = (
        (0, 'Image/Graphic'),
        (1, 'Video/Embed'),
        (2, 'Document/Include'),
    )
    upload_type = models.PositiveSmallIntegerField(choices=UPLOAD_TYPES)

    def get_template(self):
        if self.upload_type == 0:
            return template.loader.get_template('uploads/graphic.html')
        elif self.upload_type == 1:
            return template.loader.get_template('uploads/embed.html')
        elif self.upload_type == 2:
            return template.loader.get_template('uploads/include.html')
        else:
            raise ValueError('Invalid UserUpload Type: %s' % self.upload_type)


class Document(models.Model, SelfRendering):
    """
    Generic container for a blank template.
    """
    name = models.CharField(max_length=255)
    owners = models.ManyToManyField(User, related_name='documents_owned',
                                    limit_choices_to={'is_staff': True})
    contributors = models.ManyToManyField(User, related_name='documents',
                                          limit_choices_to={'is_staff': True})
    is_fluid = models.BooleanField(default=False,
                                   verbose_name='Enable Fullscreen Layout')
    attached_files = models.ManyToManyField(UserUpload,
                                            related_name='documents')

    # pylint: disable=E1101
    def collaborators(self):
        return self.owners.all() + self.contributors.all()

    # pylint: disable=E1101
    @property
    def elements(self):
        return (BaseElement.objects
                    .select_subclasses()
                    .filter(row__in=self.rows.all()))

    # pylint: disable=E1101
    def supply_context(self):
        return {'document': self}

    def __unicode__(self):
        return self.name


class GridRow(BaseNode):
    """
    A row of elements attached to a document, part of Bootstrap's grid system.
    """
    document = models.ForeignKey(Document, related_name='rows')

    def supply_context(self):
        return {
            'elements': self.elements.select_subclasses(),
            'row': self
        }

    def __unicode__(self):
        return '%s object(s)' % self.elements.count()


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
