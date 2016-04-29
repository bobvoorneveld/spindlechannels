from __future__ import absolute_import, unicode_literals

from django.apps import AppConfig


class MapAppConfig(AppConfig):
    name = 'map'
    verbose_name = 'Map'

    def ready(self):
        from . import signals
