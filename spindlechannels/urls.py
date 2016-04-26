from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.views.generic.base import TemplateView


urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^', include('spindlechannels.chat.urls')),
    url(r'^$', TemplateView.as_view(template_name='spindle.html'), name='spindle'),
]

if settings.DEBUG and settings.MEDIA_ROOT:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
