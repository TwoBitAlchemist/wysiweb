"""
Models defining elements in the DocumentCreator toolbar, and their associated
MediaObjects and types.
"""
from main.models import BaseElement, ComponentLibrary


# pylint: disable=C0103
toolbar = ComponentLibrary()


# pylint: disable=R0904
@toolbar.register(group='Presentation')
class ImageSlideshow(BaseElement):
    """
    A jQuery-based image slideshow based on the JSSOR library.

    Easily add images to a responsive, touch-friendly slideshow with support
    for hundreds of transitions and effects.

    http://jssor.com/
    """
    pass


# pylint: disable=R0904
@toolbar.register(group='Text')
class Jumbotron(BaseElement):
    """
    This is a 'hero unit', a simple jumbotron-style component for calling
    extra attention to featured content or information.

    Provided by Twitter Bootstrap.
    """
    pass
