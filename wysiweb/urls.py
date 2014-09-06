from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

from main.views import default_toolbar

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'wysiweb.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin_tools/', include('admin_tools.urls')),
    url(r'^', include(admin.site.urls)),
    url(r'^toolbar', default_toolbar, name='toolbar'),
)
