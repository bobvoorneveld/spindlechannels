from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Add default demo users'

    def handle(self, *args, **options):
		User.objects.create_user(username="green", password="green13May")
		User.objects.create_user(username="blue", password="blue13May")
