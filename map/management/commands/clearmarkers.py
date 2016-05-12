from django.core.management.base import BaseCommand

from map.models import Marker
from map.signals import send_notification


class Command(BaseCommand):
    help = 'Remove all markers'

    def handle(self, *args, **options):
        Marker.objects.all().delete()

        send_notification({
            'type': 'clear'
        })
