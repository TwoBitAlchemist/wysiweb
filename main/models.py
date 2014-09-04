"""
High-level containers and document types
"""
from django.db import models
from mptt.models import MPTTModel, TreeForeignKey


class BaseElement(MPTTModel):
    """
    The base class for nodes in various tree structures.

    Provides MPTT-inherited features and basic funtionality
    """
    class MPTTMeta:
        order_insertion_by = ('index',)

    parent = TreeForeignKey('self', null=True, blank=True,
                            related_name='children')
    index = models.PositiveSmallIntegerField(unique=True)


class Document(models.Model):
    """Generic container for a blank template"""
    name = models.CharField(max_length=255)
    elements = models.ManyToManyField(BaseElement, related_name='documents')
