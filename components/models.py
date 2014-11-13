"""
Models defining elements in the DocumentCreator toolbar, and their associated
MediaObjects and types.
"""
from django.db import models

from main.models import BaseElement, ComponentLibrary


# pylint: disable=C0103
toolbar = ComponentLibrary()


# pylint: disable=R0904
@toolbar.register(group='Presentation')
class Carousel(BaseElement):
    """
    A slideshow component for cycling through elemnts, like a carousel.
    Nested carousels are not supported.

    Provided by Twitter Bootstrap.
    """
    slides = models.PositiveSmallIntegerField(default=3)


# pylint: disable=R0904
@toolbar.register(group='Text')
class Jumbotron(BaseElement):
    """
    This is a 'hero unit', a simple jumbotron-style component for calling
    extra attention to featured content or information.

    Provided by Twitter Bootstrap.
    """
    pass


#pylint: disable=R0904
@toolbar.register(group='Text')
class PlainText(BaseElement):
    """
    A basic text object for adding arbitrary content and styling it
    however you want.
    """
    pass
