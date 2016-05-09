from django.core.management.base import BaseCommand, CommandError
from django.db import IntegrityError
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Add default demo users'

    def handle(self, *args, **options):
		try:
			User.objects.create_user(username="pygrunn1", password="13May")
			User.objects.create_user(username="pygrunn2", password="13May")
		except IntegrityError as ie:
			pass
