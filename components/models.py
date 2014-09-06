"""
Models defining elements in the DocumentCreator toolbar, and their associated
MediaObjects and types.
"""
from django.db import models

from main.models import BaseElement, MediaObject


class ComponentType(models.Model):
    """
    Model defining the tabs in the DocumentCreator toolbar that organize
    the various Components into categories.
    """
    name = models.CharField(max_length=20)

    def __unicode__(self):
        return self.name
