"""
Models defining elements in the DocumentCreator toolbar, and their associated
MediaObjects and types.
"""
from django.db import models

from main.models import BaseElement, ComponentLibrary


toolbar = ComponentLibrary()


@toolbar.register(group='Presentation')
class ImageSlideshow(BaseElement):
    """
    A jQuery-based image slideshow based on the JSSOR library.

    Easily add images to a responsive, touch-friendly slideshow with support
    for hundreds of transitions and effects.

    http://jssor.com/
    """
    pass


@toolbar.register(group='Text')
class Jumbotron(BaseElement):
    """
    This is a 'hero unit', a simple jumbotron-style component for calling
    extra attention to featured content or information.

    Provided by Twitter Bootstrap.
    """
    pass
