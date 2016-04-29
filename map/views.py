from django.conf import settings
from django.views.generic import TemplateView


class HomeView(TemplateView):
    template_name = 'map/base.html'

    def get_context_data(self, **kwargs):
        context = super(HomeView, self).get_context_data(**kwargs)
        context.update({'maps_key': settings.GOOGLEMAPS_API_KEY})
        return context
