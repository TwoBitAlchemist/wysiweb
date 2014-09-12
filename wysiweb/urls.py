from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

from main import views as main_views

urlpatterns = patterns('',
    url(r'^admin_tools/', include('admin_tools.urls')),
    url(r'^main/document/(?P<pk>\d+)/results/$',
        main_views.document_preview, name='preview'),
    url(r'^', include(admin.site.urls)),
    url(r'^addelem', main_views.add_to_document, name='add_to_document'),
    url(r'^toolbar', main_views.default_toolbar, name='toolbar'),
    url(r'^toolopts', main_views.generate_tool_options, name='toolopts'),
)
