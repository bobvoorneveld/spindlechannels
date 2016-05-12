from django.core.management.base import BaseCommand

from map.models import Marker


class Command(BaseCommand):
    help = 'Remove all markers'

    def handle(self, *args, **options):
        Marker.objects.all().delete()
